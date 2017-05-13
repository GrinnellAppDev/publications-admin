/**
 * saga.ts
 *
 * Created by Zander Otavka on 5/9/17.
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

import {delay, Task} from "redux-saga"
import {all, call, fork, spawn, cancel, cancelled, take, select, put,
        Effect} from "redux-saga/effects"
import {hashHistory} from "react-router"
import {v4 as uuid} from "uuid"
import * as cognito from "amazon-cognito-identity-js"

import {StateModel, ShortArticleModel, FullArticleModel, PublicationModel,
        ToastModel} from "./models"
import {getDefaultPublicationId} from "./selectors"
import * as actions from "./actions"
import api, {FetchError, PaginatedArray} from "./api"
import createErrorClass, {CustomError} from "./createErrorClass"

interface CognitoCallbacks {
    onSuccess(session: cognito.CognitoUserSession): void
    onFailure(err: Error): void
    newPasswordRequired?(): void
}

interface Authenticator {
    (callbacks: CognitoCallbacks): void
}

const DEFAULT_TOAST_DURATION = 4000
const LOCAL_STORAGE_HAS_USER_KEY = "CognitoHasUser"

const NewPasswordRequiredError = createErrorClass("NEW_PASSWORD_REQUIRED_ERROR")

type AuthErrorPayload = {err: Error}
type AuthError = CustomError<AuthErrorPayload>
const AuthError = createErrorClass<AuthErrorPayload>(
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

function isExpired(date: number): boolean {
    return date < Date.now()
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

function localStorageHasUser(): boolean {
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

function* createToast(item: ToastModel): Iterator<Effect> {
    try {
        yield put(actions.createToast({item}))

        const closeAction: actions.CloseToast = yield take((action: any) =>
            actions.closeToast.isTypeOf(action) && action.payload.toastId === item.id
        )
        const {buttonId} = closeAction.payload

        return buttonId
    } finally {
        if (yield cancelled()) {
            yield put(actions.closeToast({toastId: item.id}))
        }
    }

}

function* createTimedToast(item: ToastModel,
                           duration: number = DEFAULT_TOAST_DURATION): Iterator<Effect> {
    const delayTask: Task = yield fork(function* (): Iterator<Effect> {
        yield call(delay, duration)
        yield put(actions.closeToast({toastId: item.id}))
    })

    const buttonId: string = yield call(createToast, item)

    if (buttonId) {
        yield cancel(delayTask)
    }

    return buttonId
}

function* createInfoToast(text: string, duration?: number): Iterator<Effect> {
    const item: ToastModel = {
        id: uuid(),
        buttons: [
            {
                id: uuid(),
                text: "Close",
            }
        ],
        text,
    }

    return yield call(createTimedToast, item, duration)
}

function* loadFullArticle(publicationId: string, articleId: string): Iterator<Effect> {
    try {
        const item: FullArticleModel = yield call(api.articles.get, publicationId, articleId)
        yield put(actions.recieveFullArticle({item}))
        return item
    } catch (err) {
        if (FetchError.isTypeOf(err)) {
            yield spawn(createInfoToast, "There was a problem loading the article.")
        }

        throw err
    }
}

function* putAuthData(user: cognito.CognitoUser, authenticate: Authenticator): Iterable<Effect> {
    try {
        const session: cognito.CognitoUserSession =
            yield call(getSessionFromAuthenticator, authenticate)

        yield put(actions.receiveAuthInfo({
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

function* handleAuthError(err: AuthError): Iterable<Effect> {
    yield spawn(createInfoToast, err.message)
    yield put(actions.receiveAuthError({}))
    yield call(setLocalStorageHasUser, false)
}

function* refreshAuth(userPool: cognito.CognitoUserPool | null = null): Iterator<Effect> {
    if (yield call(localStorageHasUser)) {
        const loadedUserPool = (userPool) ? userPool : yield call(loadUserPool)
        const user: cognito.CognitoUser = yield call(getCurrentUser, loadedUserPool)
        yield call(putAuthData, user, getAuthenticator((callback) => user.getSession(callback)))
    } else {
        throw new AuthError("", {err: new Error("Please sign in.")})
    }
}

function* handleInitialLoad(): Iterator<Effect> {
    const selectAction: actions.SelectPublication = yield take(actions.selectPublication.type)
    const {publicationId} = selectAction.payload

    if (yield call(localStorageHasUser)) {
        yield put(actions.loadAuthInfo({}))
    }

    try {
        let pageToken: string | null = null
        while (pageToken !== PaginatedArray.LAST_PAGE_TOKEN) {
            yield put(actions.startLoadingPublications({}))
            const page: PaginatedArray<PublicationModel> =
                yield call(api.publications.list, pageToken)
            yield put(actions.receivePublications({page}))

            pageToken = page.nextPageToken
        }
    } catch (err) {
        if (FetchError.isTypeOf(err)) {
            yield spawn(createToast, {
                id: uuid(),
                text: "Could not load publications.  Check you internet connection and refresh " +
                      "the page.",
                buttons: [],
            })
        }

        throw err
    }

    if (!publicationId) {
        const defaultPublicationId: string = yield select(getDefaultPublicationId)
        hashHistory.replace(`/${defaultPublicationId}`)
    }
}

function* handleAuth(): Iterator<Effect | Promise<any>> {
    while (true) {
        const signInAction: actions.SignIn | actions.LoadAuthInfo =
            yield take([actions.signIn.type, actions.loadAuthInfo.type])

        const {AuthenticationDetails, CognitoUser}: typeof cognito =
            yield call(importCognito)

        const userPool: cognito.CognitoUserPool = yield call(loadUserPool)

        if (actions.signIn.isTypeOf(signInAction)) {
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

        const signOutAction: actions.SignOut | actions.ReceiveAuthError =
            yield take([actions.signOut.type, actions.receiveAuthError.type])

        if (actions.signOut.isTypeOf(signOutAction)) {
            const user: cognito.CognitoUser = yield call(getCurrentUser, userPool)
            yield call(signOut, user)
        }

        yield call(setLocalStorageHasUser, false)
    }
}

function* handleRefreshArticles(): Iterator<Effect> {
    while (true) {
        const refreshAction: actions.RefreshArticles = yield take(actions.refreshArticles.type)
        const {publicationId} = refreshAction.payload
        try {
            const page: PaginatedArray<ShortArticleModel> =
                yield call(api.articles.list, publicationId, null)

            yield put(actions.clearArticles({publicationId}))
            yield put(actions.receiveArticles({publicationId, page}))
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                yield spawn(createInfoToast, "There was a problem refreshing articles.")
            } else {
                throw err
            }
        }
    }
}

function* handleLoadNextArticles(): Iterator<Effect> {
    while (true) {
        const loadAction: actions.LoadNextArticles = yield take(actions.loadNextArticles.type)
        const {publicationId} = loadAction.payload
        const {articlesPageTokensByParentId}: StateModel = yield select()
        const pageToken = articlesPageTokensByParentId[publicationId]

        try {
            const page: PaginatedArray<ShortArticleModel> =
                yield call(api.articles.list, publicationId, pageToken)

            yield put(actions.receiveArticles({publicationId, page}))
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                yield spawn(createInfoToast, "There was a problem loading articles.")
            } else {
                throw err
            }
        }
    }
}

function* handleLoadArticleDrafts(): Iterator<Effect> {
    while (true) {
        const action: any = yield take(actions.loadArticleDraft.type)
        yield fork(function* (loadAction: actions.LoadArticleDraft): Iterator<Effect> {
            const {publicationId, articleId} = loadAction.payload

            const {articleDraftsById}: StateModel = yield select()
            const savedDraft = articleDraftsById[articleId]

            try {
                const item: FullArticleModel = (savedDraft) ? (
                    savedDraft
                ) : (
                    yield call(loadFullArticle, publicationId, articleId)
                )

                yield put(actions.createArticleDraft({id: articleId, item}))
            } catch (err) {
                if (FetchError.isTypeOf(err)) {
                    hashHistory.goBack()
                } else {
                    throw err
                }
            }
        }, action)
    }
}

function* handleSubmitArticleDraft(): Iterator<Effect> {
    while (true) {
        const action: any = yield take(actions.submitArticleDraft.type)
        yield fork(function* (submitAction: actions.SubmitArticleDraft): Iterator<Effect> {
            const {publicationId, articleId} = submitAction.payload
            const {auth, articleDraftsById}: StateModel = yield select()
            const draft = articleDraftsById[articleId || ""]
            const isNew = !articleId

            if (!auth.token) {
                yield spawn(createInfoToast,
                            `You must be signed in to ${isNew ? "create" : "edit"} articles.`)
            } else {
                try {
                    if (isExpired(auth.expiration)) {
                        yield call(refreshAuth)
                    }

                    const {auth: newAuth}: StateModel = yield select()

                    const item: FullArticleModel = (isNew) ? (
                        yield call(api.articles.create, publicationId, draft, newAuth.token)
                    ) : (
                        yield call(api.articles.edit, publicationId, articleId, draft,
                                   newAuth.token)
                    )

                    yield put(actions.receiveArticleSubmitSuccess({id: item.id, item, isNew}))
                    hashHistory.goBack()
                } catch (err) {
                    if (FetchError.isTypeOf(err)) {
                        yield spawn(createInfoToast, "There was a problem submitting your article.")
                        yield put(actions.receiveArticleSubmitError({id: articleId}))
                    } else if (AuthError.isTypeOf(err)) {
                        yield call(handleAuthError, err)
                    } else {
                        throw err
                    }
                }
            }
        }, action)
    }
}

function* handleDiscardArticleDraft(): Iterator<Effect> {
    while (true) {
        yield take(actions.discardArticleDraft.type)
        hashHistory.goBack()
    }
}

function* handleDeleteArticle(): Iterator<Effect> {
    while (true) {
        const action: any = yield take(actions.deleteArticle.type)
        yield fork(function* (deleteAction: actions.DeleteArticle): Iterator<Effect> {
            const {auth, articlesById}: StateModel = yield select()

            if (!auth.token) {
                yield spawn(createInfoToast, "You must be signed in to delete articles.")
            } else {
                const {id} = deleteAction.payload
                yield put(actions.deleteLocalArticle({id}))

                const article = articlesById[id]
                const title = ((article.title || "").length > 20) ? (
                    article.title.substring(0, 15).trim() + "..." +
                    article.title.substring(article.title.length - 5).trim()
                ) : (
                    article.title || "Untitled"
                )

                const undoButton = {
                    id: uuid(),
                    text: "Undo",
                }

                const buttonId: string = yield call(createTimedToast, {
                    id: uuid(),
                    text: `Deleting "${title}"`,
                    buttons: [undoButton, {id: uuid(), text: "Close"}]
                })

                if (buttonId === undoButton.id) {
                    yield put(actions.undeleteArticle({item: article}))
                } else {
                    try {
                        if (isExpired(auth.expiration)) {
                            yield call(refreshAuth)
                        }

                        const {auth: newAuth}: StateModel = yield select()
                        yield call(api.articles.remove, article.publication, article.id,
                                   newAuth.token)
                    } catch (err) {
                        if (FetchError.isTypeOf(err)) {
                            yield spawn(createInfoToast,
                                        "There was a problem deleting the article.")
                            yield put(actions.undeleteArticle({item: article}))
                        } else if (AuthError.isTypeOf(err)) {
                            yield call(handleAuthError, err)
                        } else {
                            throw err
                        }
                    }
                }
            }
        }, action)
    }
}

export default function* rootSaga(): Iterator<Effect> {
    yield all([
        call(handleInitialLoad),
        call(handleAuth),
        call(handleRefreshArticles),
        call(handleLoadNextArticles),
        call(handleLoadArticleDrafts),
        call(handleSubmitArticleDraft),
        call(handleDiscardArticleDraft),
        call(handleDeleteArticle),
    ])
}
