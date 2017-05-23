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

export interface ChangePasswordModel {
    readonly isShown: boolean
    readonly isCorrectLength: boolean
    readonly isCorrectCharacters: boolean
    readonly isMatching: boolean
}

export interface AuthenticationModel {
    readonly username: string
    readonly token: string
    readonly expiration: number
    readonly isLoading: boolean
    readonly changePassword: ChangePasswordModel
}

// Actions

export namespace authActions {
    type SignInPayload = {username: string, password: string}
    export type SignIn = Action<SignInPayload>
    export const signIn = actionCreator<SignInPayload>("SIGN_IN")

    type LoadInfoPayload = {}
    export type LoadInfo = Action<LoadInfoPayload>
    export const loadInfo = actionCreator<LoadInfoPayload>("LOAD_AUTH_INFO")

    type SignOutPayload = {}
    export type SignOut = Action<SignOutPayload>
    export const signOut = actionCreator<SignOutPayload>("SIGN_OUT")

    type ReceiveInfoPayload = {username: string, token: string, expiration: number}
    export const receiveInfo = actionCreator<ReceiveInfoPayload>("RECEIVE_AUTH_INFO")

    type ReceiveErrorPayload = {}
    export type ReceiveError = Action<ReceiveErrorPayload>
    export const receiveError = actionCreator<ReceiveErrorPayload>("RECEIVE_AUTH_ERROR")

    type RequestNewPasswordPayload = {}
    export const requestNewPassword =
        actionCreator<RequestNewPasswordPayload>("REQUEST_NEW_PASSWORD")

    type NewPasswordChangePayload = {field1: string, field2: string}
    export type NewPasswordChange = Action<NewPasswordChangePayload>
    export const newPasswordChange = actionCreator<NewPasswordChangePayload>("NEW_PASSWORD_CHANGE")

    type NewPasswordValidatePayload = {
        isCorrectLength: boolean,
        isCorrectCharacters: boolean,
        isMatching: boolean,
    }
    export const newPasswordValidate =
        actionCreator<NewPasswordValidatePayload>("NEW_PASSWORD_VALIDATE")

    type NewPasswordCancelPayload = {}
    export type NewPasswordCancel = Action<NewPasswordCancelPayload>
    export const newPasswordCancel = actionCreator<NewPasswordCancelPayload>("NEW_PASSWORD_CANCEL")

    type NewPasswordSubmitPayload = {field1: string, field2: string}
    export type NewPasswordSubmit = Action<NewPasswordSubmitPayload>
    export const newPasswordSubmit = actionCreator<NewPasswordSubmitPayload>("NEW_PASSWORD_SUBMIT")
}

// Reducer

const emptyNewPassword: ChangePasswordModel = {
    isShown: false,
    isCorrectLength: false,
    isCorrectCharacters: false,
    isMatching: false,
}

const emptyAuthModel: AuthenticationModel = {
    username: "",
    token: "",
    expiration: 0,
    isLoading: false,
    changePassword: emptyNewPassword,
}

export function authReducer(
    state: AuthenticationModel = emptyAuthModel,
    action: Action<any>,
): AuthenticationModel {
    if (authActions.signIn.isTypeOf(action) ||
        authActions.loadInfo.isTypeOf(action)) {

        return {...state, isLoading: true}
    }

    if (authActions.receiveInfo.isTypeOf(action)) {
        return {...state, ...action.payload, isLoading: false}
    }

    if (authActions.newPasswordValidate.isTypeOf(action)) {
        return {...state, changePassword: {...state.changePassword, ...action.payload}}
    }

    if (authActions.requestNewPassword.isTypeOf(action)) {
        return {...state, changePassword: {...emptyNewPassword, isShown: true}}
    }

    if (authActions.newPasswordSubmit.isTypeOf(action)) {
        return {...state, changePassword: {...emptyNewPassword, isShown: false}}
    }

    if (authActions.signOut.isTypeOf(action) ||
        authActions.receiveError.isTypeOf(action)) {

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
    (message, payload) =>
        message + (message && payload ? " " : "") + (payload ? payload.err.message : "")
)

async function importCognito(): Promise<typeof cognito> {
    return System.import(/* webpackChunkName: "aws-cognito" */ "amazon-cognito-identity-js")
}

async function loadUserPool(): Promise<cognito.CognitoUserPool> {
    const {CognitoUserPool} = await importCognito()
    return new CognitoUserPool({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        ClientId: process.env.COGNITO_CLIENT_ID,
    })
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

        yield put(authActions.receiveInfo({
            username: user.getUsername(),
            token: session.getAccessToken().getJwtToken(),
            expiration: session.getAccessToken().getExpiration(),
        }))
    } catch (err) {
        if (NewPasswordRequiredError.isTypeOf(err)) {
            yield put(authActions.requestNewPassword({}))

            let newPassword: string
            while (true) {
                const action: any = yield take([
                    authActions.newPasswordChange.type,
                    authActions.newPasswordSubmit.type,
                    authActions.newPasswordCancel.type,
                ])

                if (authActions.newPasswordCancel.isTypeOf(action)) {
                    throw new AuthError("You must create a new password to sign in.")
                } else if (
                    authActions.newPasswordChange.isTypeOf(action) ||
                    authActions.newPasswordSubmit.isTypeOf(action)
                ) {
                    const {field1, field2} = action.payload
                    const isCorrectLength = field1.length > 16 || field2.length > 16
                    const isCorrectCharacters = (/[A-Z]/.test(field1) && /[a-z]/.test(field1)) ||
                                                (/[A-Z]/.test(field2) && /[a-z]/.test(field2))
                    const isMatching = field1 !== "" && field1 === field2

                    yield put(authActions.newPasswordValidate({
                        isCorrectLength,
                        isCorrectCharacters,
                        isMatching,
                    }))

                    if (authActions.newPasswordSubmit.isTypeOf(action)) {
                        if (isCorrectLength && isCorrectCharacters && isMatching) {
                            newPassword = field1
                            break
                        }
                    }
                }
            }

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
    yield put(authActions.receiveError({}))
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
            throw new AuthError("Please sign in.")
        }
    }
}

function* authFlowSaga(): Iterator<Effect | Promise<any>> {
    while (true) {
        const signInAction: authActions.SignIn | authActions.LoadInfo =
            yield take([authActions.signIn.type, authActions.loadInfo.type])

        const {AuthenticationDetails, CognitoUser}: typeof cognito =
            yield call(importCognito)

        const userPool: cognito.CognitoUserPool = yield call(loadUserPool)

        try {
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

            yield call(setLocalStorageHasUser, true)
        } catch (err) {
            if (AuthError.isTypeOf(err)) {
                yield call(handleAuthError, err)
                continue
            } else {
                throw err
            }
        }

        const signOutAction: authActions.SignOut | authActions.ReceiveError =
            yield take([authActions.signOut.type, authActions.receiveError.type])

        if (authActions.signOut.isTypeOf(signOutAction)) {
            const user: cognito.CognitoUser = yield call(getCurrentUser, userPool)
            yield call(signOut, user)
        }

        yield call(setLocalStorageHasUser, false)
    }
}

function* initialLoadSaga(): Iterable<Effect> {
    if (yield call(localStorageHasUser)) {
        yield put(authActions.loadInfo({}))
    }
}

export function* authSaga(): Iterable<Effect> {
    yield all([
        call(authFlowSaga),
        call(initialLoadSaga),
    ])
}
