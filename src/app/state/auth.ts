/**
 * auth.ts
 *
 * Created by Zander Otavka on 5/15/17.
 * Copyright (C) 2016  Grinnell AppDev.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {all, call, spawn, take, select, put, Effect} from "redux-saga/effects"
import * as cognito from "amazon-cognito-identity-js"

import {actionCreator, Action, createErrorClass, CustomError, isExpired} from "./util"
import {createInfoToast} from "./toasts"
import {getAuth} from "./selectors"

// Model

export interface AuthenticationModel {
    readonly username: string
    readonly token: string
    readonly expiration: number
    readonly isLoading: boolean
}

// Actions

export namespace authActions {
    type SignInPayload = {username: string, password: string}
    export type SignIn = Action<SignInPayload>
    export const signIn = actionCreator<SignInPayload>("SIGN_IN")

    type LoadAuthInfoPayload = {}
    export type LoadAuthInfo = Action<LoadAuthInfoPayload>
    export const loadAuthInfo = actionCreator<LoadAuthInfoPayload>("LOAD_AUTH_INFO")

    type SignOutPayload = {}
    export type SignOut = Action<SignOutPayload>
    export const signOut = actionCreator<SignOutPayload>("SIGN_OUT")

    type ReceiveAuthInfoPayload = {username: string, token: string, expiration: number}
    export const receiveAuthInfo = actionCreator<ReceiveAuthInfoPayload>("RECEIVE_AUTH_INFO")

    type ReceiveAuthErrorPayload = {}
    export type ReceiveAuthError = Action<ReceiveAuthErrorPayload>
    export const receiveAuthError = actionCreator<ReceiveAuthErrorPayload>("RECEIVE_AUTH_ERROR")
}

// Reducer

const emptyAuthModel: AuthenticationModel = {
    username: "",
    token: "",
    expiration: 0,
    isLoading: false,
}

export function authReducer(
    state: AuthenticationModel = emptyAuthModel,
    action: Action<any>,
): AuthenticationModel {
    if (authActions.signIn.isTypeOf(action) ||
        authActions.loadAuthInfo.isTypeOf(action)) {

        return {...state, isLoading: true}
    }

    if (authActions.receiveAuthInfo.isTypeOf(action)) {
        return {...action.payload, isLoading: false}
    }

    if (authActions.signOut.isTypeOf(action) ||
        authActions.receiveAuthError.isTypeOf(action)) {

        return emptyAuthModel
    }

    return state
}

// Saga Helpers

interface CognitoCallbacks {
    onSuccess(session: cognito.CognitoUserSession): void
    onFailure(err: Error): void
    newPasswordRequired?(): void
}

interface Authenticator {
    (callbacks: CognitoCallbacks): void
}

const LOCAL_STORAGE_HAS_USER_KEY = "CognitoHasUser"

const NewPasswordRequiredError = createErrorClass("NEW_PASSWORD_REQUIRED_ERROR")

type AuthErrorPayload = {err: Error}
export type AuthError = CustomError<AuthErrorPayload>
export const AuthError = createErrorClass<AuthErrorPayload>(
    "AUTH_ERROR",
    (message, {err}) => (message ? message + " " : "") + err.message
)

function importCognito(): Promise<typeof cognito> {
    return System.import(/* webpackChunkName: "aws-cognito" */ "amazon-cognito-identity-js")
}

function loadUserPool(): Promise<cognito.CognitoUserPool> {
    return importCognito()
        .then(({CognitoUserPool}) => new CognitoUserPool({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            ClientId: process.env.COGNITO_CLIENT_ID,
        }))
}

function getAuthenticator(
    func: (cb: (err: Error, session: cognito.CognitoUserSession) => void) => void
): Authenticator {
    return (callbacks) => {
        func((err: Error, session: cognito.CognitoUserSession) => {
            if (err) {
                callbacks.onFailure(err)
            } else {
                callbacks.onSuccess(session)
            }
        })
    }
}

function getSessionFromAuthenticator(
    authenticate: Authenticator
): Promise<cognito.CognitoUserSession> {
    return new Promise<cognito.CognitoUserSession>((resolve, reject) => {
        authenticate({
            onSuccess: resolve,
            onFailure: (err: Error) => reject(new AuthError(
                "There was a problem signing in.",
                {err}
            )),
            newPasswordRequired: () => reject(new NewPasswordRequiredError()),
        })
    })
}

export function localStorageHasUser(): boolean {
    return window.localStorage && !!window.localStorage.getItem(LOCAL_STORAGE_HAS_USER_KEY)
}

function setLocalStorageHasUser(hasUser: boolean): void {
    if (window.localStorage) {
        if (hasUser) {
            window.localStorage.setItem(LOCAL_STORAGE_HAS_USER_KEY, "true")
        } else {
            window.localStorage.removeItem(LOCAL_STORAGE_HAS_USER_KEY)
        }
    }
}

function signOut(user: cognito.CognitoUser): void {
    user.signOut()
}

function getCurrentUser(userPool: cognito.CognitoUserPool): cognito.CognitoUser {
    return userPool.getCurrentUser()
}

// Saga

function* putAuthData(user: cognito.CognitoUser, authenticate: Authenticator): Iterable<Effect> {
    try {
        const session: cognito.CognitoUserSession =
            yield call(getSessionFromAuthenticator, authenticate)

        yield put(authActions.receiveAuthInfo({
            username: user.getUsername(),
            token: session.getAccessToken().getJwtToken(),
            expiration: session.getAccessToken().getExpiration(),
        }))
    } catch (err) {
        if (NewPasswordRequiredError.isTypeOf(err)) {
            const newPassword = prompt(
                "Enter new password (must be over 16 characters long and contain both " +
                "uppercase and lowercase letters)"
            )

            yield call(putAuthData, user, (callbacks: CognitoCallbacks) => {
                user.completeNewPasswordChallenge(newPassword, {}, callbacks)
            })
        } else {
            throw err
        }
    }
}

export function* handleAuthError(err: AuthError): Iterable<Effect> {
    yield spawn(createInfoToast, err.message)
    yield put(authActions.receiveAuthError({}))
    yield call(setLocalStorageHasUser, false)
}

export function* refreshAuth(userPool: cognito.CognitoUserPool | null = null): Iterator<Effect> {
    const auth: AuthenticationModel = yield select(getAuth)
    if (isExpired(auth.expiration)) {
        if (yield call(localStorageHasUser)) {
            const loadedUserPool = (userPool) ? userPool : yield call(loadUserPool)
            const user: cognito.CognitoUser = yield call(getCurrentUser, loadedUserPool)
            yield call(putAuthData, user, getAuthenticator((callback) => user.getSession(callback)))
        } else {
            throw new AuthError("", {err: new Error("Please sign in.")})
        }
    }
}

function* authFlowSaga(): Iterator<Effect | Promise<any>> {
    while (true) {
        const signInAction: authActions.SignIn | authActions.LoadAuthInfo =
            yield take([authActions.signIn.type, authActions.loadAuthInfo.type])

        const {AuthenticationDetails, CognitoUser}: typeof cognito =
            yield call(importCognito)

        const userPool: cognito.CognitoUserPool = yield call(loadUserPool)

        if (authActions.signIn.isTypeOf(signInAction)) {
            const {username, password} = signInAction.payload

            const authDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
            })

            const user = new CognitoUser({
                Username: username,
                Pool: userPool,
            })

            const authenticator = (callbacks: CognitoCallbacks) => {
                user.authenticateUser(authDetails, callbacks)
            }

            yield call(putAuthData, user, authenticator)
        } else {
            yield call(refreshAuth, userPool)
        }

        try {
            yield call(setLocalStorageHasUser, true)
        } catch (err) {
            if (AuthError.isTypeOf(err)) {
                yield call(handleAuthError, err)
            } else {
                throw err
            }
        }

        const signOutAction: authActions.SignOut | authActions.ReceiveAuthError =
            yield take([authActions.signOut.type, authActions.receiveAuthError.type])

        if (authActions.signOut.isTypeOf(signOutAction)) {
            const user: cognito.CognitoUser = yield call(getCurrentUser, userPool)
            yield call(signOut, user)
        }

        yield call(setLocalStorageHasUser, false)
    }
}

function* initialLoadSaga(): Iterable<Effect> {
    if (yield call(localStorageHasUser)) {
        yield put(authActions.loadAuthInfo({}))
    }
}

export function* authSaga(): Iterable<Effect> {
    yield all([
        call(authFlowSaga),
        call(initialLoadSaga),
    ])
}
