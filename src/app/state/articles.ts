/**
 * articles.ts
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

import {combineReducers} from "redux"
import {all, call, fork, spawn, take, select, put, Effect} from "redux-saga/effects"
import {v4 as uuid} from "uuid"
import {stringify as stringifyQuery} from "query-string"

import {getArticles, getAuthToken} from "./selectors"
import {Mutable, IdMapModel, actionCreator, Action, PaginatedArray, FetchError,
        API_ROOT, responseToPaginatedArray, toFetchError} from "./util"
import {createInfoToast, createTimedToast} from "./toasts"
import {refreshAuth, handleAuthError, AuthError} from "./auth"
import {draftsActions} from "./drafts"

// Models

export interface AuthorModel {
    readonly name: string
    readonly email: string
}

export interface ShortArticleModel {
    readonly id: string
    readonly publication: string
    readonly datePublished: Date
    readonly title: string
    readonly authors: AuthorModel[]
    readonly headerImage?: string
}

export interface ArticleCreateModel {
    readonly title: string
    readonly authors: AuthorModel[]
    readonly headerImage?: string
    readonly content: string
}

export interface ArticleEditModel extends Partial<ArticleCreateModel> {
}

export interface FullArticleModel extends ShortArticleModel, ArticleCreateModel {
    readonly dateEdited: Date
}

export interface ArticlesStateModel {
    readonly articlesById: IdMapModel<ShortArticleModel>
    readonly articlesPageTokensByParentId: IdMapModel<string>
    readonly loadingPublications: ReadonlyArray<string>
    readonly loadingArticles: ReadonlyArray<string>
}

// Actions

export namespace articlesActions {
    type LoadNextArticlesPayload = {publicationId: string}
    export type LoadNextArticles = Action<LoadNextArticlesPayload>
    export const loadNextArticles = actionCreator<LoadNextArticlesPayload>("LOAD_NEXT_ARTICLES")

    type ReceiveArticlesPayload = {publicationId: string, page: PaginatedArray<ShortArticleModel>}
    export const receiveArticles = actionCreator<ReceiveArticlesPayload>("RECIEVE_ARTICLES")

    type ClearArticlesPayload = {publicationId: string}
    export const clearArticles = actionCreator<ClearArticlesPayload>("CLEAR_ARTICLES")

    type RefreshArticlesPayload = {publicationId: string}
    export type RefreshArticles = Action<RefreshArticlesPayload>
    export const refreshArticles = actionCreator<RefreshArticlesPayload>("REFRESH_ARTICLES")

    type LoadFullArticlePayload = {publicationId: string, articleId: string}
    export type LoadFullArticle = Action<LoadFullArticlePayload>
    export const loadFullArticle = actionCreator<LoadFullArticlePayload>("LOAD_FULL_ARTICLE")

    type ReceiveFullArticlePayload = {item: FullArticleModel}
    export const recieveFullArticle =
        actionCreator<ReceiveFullArticlePayload>("RECIEVE_FULL_ARTICLE")

    type DeleteArticlePayload = {id: string}
    export type DeleteArticle = Action<DeleteArticlePayload>
    export const deleteArticle = actionCreator<DeleteArticlePayload>("DELETE_ARTICLE")

    type DeleteLocalArticlePayload = {id: string}
    export const deleteLocalArticle =
        actionCreator<DeleteLocalArticlePayload>("DELETE_LOCAL_ARTICLE")

    type UndeleteArticlePayload = {item: ShortArticleModel}
    export const undeleteArticle = actionCreator<UndeleteArticlePayload>("UNDELETE_ARTICLE")
}

// Reducers

function articlesByIdReducer(state: IdMapModel<ShortArticleModel> = {},
                             action: Action<any>): IdMapModel<ShortArticleModel> {
    if (articlesActions.receiveArticles.isTypeOf(action)) {
        const {page} = action.payload
        const newState = {...state} as Mutable<IdMapModel<ShortArticleModel>>
        page.items.forEach((article) => {
            newState[article.id] = (article.id in state) ? (
                {...state[article.id], ...article}
            ) : (
                article
            )
        })

        return newState
    }

    if (articlesActions.deleteLocalArticle.isTypeOf(action)) {
        const {id} = action.payload
        const {[id]: _, ...newState} = state
        return newState
    }

    if (articlesActions.recieveFullArticle.isTypeOf(action) ||
        articlesActions.undeleteArticle.isTypeOf(action) ||
        draftsActions.receiveArticleSubmitSuccess.isTypeOf(action)) {

        const {item} = action.payload
        return {...state, [item.id]: item}
    }

    if (articlesActions.clearArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        const newState = {} as Mutable<IdMapModel<ShortArticleModel>>
        Object.keys(state).forEach((articleId) => {
            if (state[articleId].publication !== publicationId) {
                newState[articleId] = state[articleId]
            }
        })

        return newState
    }

    return state
}

function articlesPageTokensByParentIdReducer(state: IdMapModel<string> = {},
                                             action: Action<any>): IdMapModel<string> {
    if (articlesActions.receiveArticles.isTypeOf(action)) {
        const {publicationId, page} = action.payload
        return {
            ...state,
            [publicationId]: page.nextPageToken,
        }
    }

    if (articlesActions.clearArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        const {[publicationId]: _, ...newState} = state
        return newState
    }

    return state
}

function loadingPublicationsReducer(state: ReadonlyArray<string> = [],
                                    action: Action<any>): ReadonlyArray<string> {
    if (articlesActions.refreshArticles.isTypeOf(action) ||
        articlesActions.loadNextArticles.isTypeOf(action)) {

        const {publicationId} = action.payload
        return [...state, publicationId]
    }

    if (articlesActions.receiveArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        return state.filter((id) => id !== publicationId)
    }

    return state
}

function loadingArticlesReducer(state: ReadonlyArray<string> = [],
                                action: Action<any>): ReadonlyArray<string> {
    if (articlesActions.loadFullArticle.isTypeOf(action)) {
        const {articleId} = action.payload
        return [...state, articleId]
    }

    if (articlesActions.recieveFullArticle.isTypeOf(action)) {
        const {item} = action.payload
        return state.filter((id) => id !== item.id)
    }

    return state
}

export const articlesReducer = combineReducers<ArticlesStateModel>({
    articlesById: articlesByIdReducer,
    articlesPageTokensByParentId: articlesPageTokensByParentIdReducer,
    loadingPublications: loadingPublicationsReducer,
    loadingArticles: loadingArticlesReducer,
})

// Saga Helpers

export function responseToArticleModel(response: any): FullArticleModel {
    return {
        ...response as FullArticleModel,
        dateEdited: new Date(response.dateEdited),
        datePublished: new Date(response.datePublished),
    }
}

function responseToShortArticleModel(response: any): ShortArticleModel {
    return {
        ...response as ShortArticleModel,
        datePublished: new Date(response.datePublished),
    }
}

async function listArticles(publicationId: string,
            pageToken: string | null): Promise<PaginatedArray<ShortArticleModel>> {
    if (pageToken === PaginatedArray.LAST_PAGE_TOKEN) {
        return {
            items: [],
            nextPageToken: PaginatedArray.LAST_PAGE_TOKEN,
        }
    }

    try {
        const params = stringifyQuery({
            pageToken: pageToken || undefined,
        })

        const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles` +
                                    `?${params}`, {
            method: "GET",
            mode: "cors",
        })

        if (!resp.ok) {
            throw new FetchError("", {resp})
        }

        return responseToPaginatedArray(responseToShortArticleModel, await resp.json())
    } catch (err) {
        throw toFetchError(err)
    }
}

async function getArticle(publicationId: string, articleId: string): Promise<FullArticleModel> {
    try {
        const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                    `${articleId}`, {
            method: "GET",
            mode: "cors",
        })

        if (!resp.ok) {
            throw new FetchError("", {resp})
        }

        return responseToArticleModel(await resp.json())
    } catch (err) {
        throw toFetchError(err)
    }
}

async function deleteArticle(publicationId: string, articleId: string,
                             authToken: string): Promise<void> {
    try {
        const headers = new Headers()
        headers.append("Authorization", authToken)

        const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                    `${articleId}`, {
            method: "DELETE",
            mode: "cors",
            headers,
        })

        if (!resp.ok) {
            throw new FetchError("", {resp})
        }
    } catch (err) {
        throw toFetchError(err)
    }
}

// Saga

export function* loadFullArticle(publicationId: string, articleId: string): Iterator<Effect> {
    try {
        const item: FullArticleModel = yield call(getArticle, publicationId, articleId)
        yield put(articlesActions.recieveFullArticle({item}))
        return item
    } catch (err) {
        if (FetchError.isTypeOf(err)) {
            yield spawn(createInfoToast, "There was a problem loading the article.")
        }

        throw err
    }
}

function* refreshArticlesSaga(): Iterator<Effect> {
    while (true) {
        const refreshAction: articlesActions.RefreshArticles =
            yield take(articlesActions.refreshArticles.type)

        const {publicationId} = refreshAction.payload
        try {
            const page: PaginatedArray<ShortArticleModel> =
                yield call(listArticles, publicationId, null)

            yield put(articlesActions.clearArticles({publicationId}))
            yield put(articlesActions.receiveArticles({publicationId, page}))
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                yield spawn(createInfoToast, "There was a problem refreshing articles.")
            } else {
                throw err
            }
        }
    }
}

function* loadNextArticlesSaga(): Iterator<Effect> {
    while (true) {
        const loadAction: articlesActions.LoadNextArticles =
            yield take(articlesActions.loadNextArticles.type)

        const {publicationId} = loadAction.payload
        const {articlesPageTokensByParentId}: ArticlesStateModel = yield select(getArticles)
        const pageToken = articlesPageTokensByParentId[publicationId]

        try {
            const page: PaginatedArray<ShortArticleModel> =
                yield call(listArticles, publicationId, pageToken)

            yield put(articlesActions.receiveArticles({publicationId, page}))
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                yield spawn(createInfoToast, "There was a problem loading articles.")
            } else {
                throw err
            }
        }
    }
}

function* deleteArticleSaga(): Iterator<Effect> {
    while (true) {
        const action: any = yield take(articlesActions.deleteArticle.type)
        yield fork(function* (deleteAction: articlesActions.DeleteArticle): Iterator<Effect> {
            const {articlesById}: ArticlesStateModel = yield select(getArticles)
            const savedToken: string = yield select(getAuthToken)

            if (!savedToken) {
                yield spawn(createInfoToast, "You must be signed in to delete articles.")
            } else {
                const {id} = deleteAction.payload
                yield put(articlesActions.deleteLocalArticle({id}))

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
                    yield put(articlesActions.undeleteArticle({item: article}))
                } else {
                    try {
                        yield call(refreshAuth)
                        const token: string = yield select(getAuthToken)
                        yield call(deleteArticle, article.publication, article.id, token)
                    } catch (err) {
                        if (FetchError.isTypeOf(err)) {
                            yield spawn(createInfoToast,
                                        "There was a problem deleting the article.")
                            yield put(articlesActions.undeleteArticle({item: article}))
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

export function* articlesSaga(): Iterator<Effect> {
    yield all([
        call(refreshArticlesSaga),
        call(loadNextArticlesSaga),
        call(deleteArticleSaga),
    ])
}
