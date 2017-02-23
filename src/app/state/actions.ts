/**
 * actions.ts
 *
 * Created by Zander Otavka on .
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

import {Action} from "redux"
import {ThunkAction} from "redux-thunk"
import {replace} from "react-router-redux"

import {PublicationModel, ArticleBriefModel, ArticleEditModel, FullArticleModel,
        StateModel} from "./models"
import {Api, FetchError} from "./api"
import createErrorClass from "./createErrorClass"
import {getDefaultPublicationId} from "./selectors"

export interface SyncAction<T> extends Action {
    readonly type: string
    readonly payload: T
}

export interface ThunkContext {
    api: Api
}

export interface AsyncAction<T> extends ThunkAction<Promise<T>, StateModel, ThunkContext> {
}


interface SyncActionCreator<T> {
    (payload: T): SyncAction<T>
    isTypeOf(action: SyncAction<any>): action is SyncAction<T>
}

function createSyncActionCreator<T>(type: string): SyncActionCreator<T> {
    return Object.assign(
        (payload: T): SyncAction<T> => ({type, payload}),
        {
            isTypeOf: (action: SyncAction<any>): action is SyncAction<T> => action.type === type,
        },
    )
}

type StartInitialLoadPayload = {}
export const startInitialLoad =
    createSyncActionCreator<StartInitialLoadPayload>("START_INITIAL_LOAD")

type StartLoadingPublicationsPayload = {}
export const startLoadingPublications =
    createSyncActionCreator<StartLoadingPublicationsPayload>("START_LOADING_PUBLICATIONS")

type ReceivePublicationsPayload = {items: ReadonlyArray<PublicationModel>}
export const receivePublications =
    createSyncActionCreator<ReceivePublicationsPayload>("RECIEVE_PUBLICATIONS")

type StartLoadingArticlesPayload = {publicationId: string}
export const startLoadingArticles =
    createSyncActionCreator<StartLoadingArticlesPayload>("START_LOADING_ARTICLES")

type ReceiveArticlesPayload = {publicationId: string, items: ReadonlyArray<ArticleBriefModel>}
export const receiveArticles =
    createSyncActionCreator<ReceiveArticlesPayload>("RECIEVE_ARTICLES")

type StartLoadingFullArticlePayload = {id: string}
export const startLoadingFullArticle =
    createSyncActionCreator<StartLoadingFullArticlePayload>("START_LOADING_FULL_ARTICLE")

type ReceiveFullArticlePayload = {item: FullArticleModel}
export const recieveFullArticle =
    createSyncActionCreator<ReceiveFullArticlePayload>("RECIEVE_FULL_ARTICLE")

type ClearArticlesPayload = {publicationId: string}
export const clearArticles =
    createSyncActionCreator<ClearArticlesPayload>("CLEAR_ARTICLES")

type DeleteLocalArticlePayload = {id: string}
export const deleteLocalArticle =
    createSyncActionCreator<DeleteLocalArticlePayload>("DELETE_LOCAL_ARTICLE")

type UndeleteLocalArticlePayload = {item: ArticleBriefModel}
export const undeleteLocalArticle =
    createSyncActionCreator<UndeleteLocalArticlePayload>("UNDELETE_LOCAL_ARTICLE")

type CreateArticleDraftPayload = {id: string, item: ArticleEditModel}
export const createArticleDraft =
    createSyncActionCreator<CreateArticleDraftPayload>("CREATE_ARTICLE_DRAFT")

type UpdateArticleDraftPayload = {
    id: string,
    update: (draft: ArticleEditModel) => Partial<ArticleEditModel>
}
export const updateArticleDraft =
    createSyncActionCreator<UpdateArticleDraftPayload>("UPDATE_ARTICLE_DRAFT")

type StartSubmittingArticleDraftPayload = {}
export const startSubmittingArticleDraft =
    createSyncActionCreator<StartSubmittingArticleDraftPayload>("START_SUBMITTING_ARTICLE_DRAFT")

type ReceiveArticleSubmitErrorPayload = {}
export const receiveArticleSubmitError =
    createSyncActionCreator<ReceiveArticleSubmitErrorPayload>("RECEIVE_ARTICLE_SUBMIT_ERROR")

type ReceiveArticleSubmitSuccessPayload = {item: FullArticleModel, isNew: boolean}
export const receiveArticleSubmitSuccess =
    createSyncActionCreator<ReceiveArticleSubmitSuccessPayload>("RECEIVE_ARTICLE_SUBMIT_SUCCESS")


export const AlreadyLoadingError = createErrorClass<void>(
    "ALREADY_LOADING_ERROR",
    message => `Cannot load. ${message}`,
)

export function loadPublications(): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        if (!getState().isLoadingPublications) {
            dispatch(startLoadingPublications({}))
            dispatch(receivePublications({
                items: await api.publications.list(),
            }))
        } else {
            throw new AlreadyLoadingError("Already loading publications.")
        }
    }
}

export function loadArticles(publicationId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        if (getState().loadingPublications.includes(publicationId)) {
            throw new AlreadyLoadingError("Already loading articles.")
        }

        dispatch(startLoadingArticles({publicationId}))
        dispatch(receiveArticles({
            publicationId,
            items: await api.articles.list(publicationId),
        }))
    }
}

export function reloadArticles(publicationId: string): AsyncAction<void> {
    return async dispatch => {
        dispatch(clearArticles({publicationId}))
        await dispatch(loadArticles(publicationId))
    }
}

export function loadFullArticle(publicationId: string,
                                articleId: string): AsyncAction<FullArticleModel> {
    return async (dispatch, getState, {api}) => {
        dispatch(startLoadingFullArticle({id: articleId}))

        const item = await api.articles.get(publicationId, articleId)
        dispatch(recieveFullArticle({item}))
        return item
    }
}

export function maybeDoInitialLoad(publicationId: string = ""): AsyncAction<void> {
    return async (dispatch, getState) => {
        if (!getState().didInitialLoad) {
            await dispatch(loadPublications())

            if (!publicationId) {
                const defaultPublicationId = getDefaultPublicationId(getState())
                dispatch(replace(`/publications/${defaultPublicationId}/articles`))
            }

            await dispatch(reloadArticles(publicationId))
        }
    }
}

export function submitArticleDraft(publicationId: string, articleId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        const draft = getState().articleDraftsById[articleId || ""]
        dispatch(startSubmittingArticleDraft({}))

        try {
            const isNew = !articleId
            dispatch(receiveArticleSubmitSuccess({
                isNew,
                item: (isNew) ? (
                    await api.articles.create(publicationId, draft)
                ) : (
                    await api.articles.edit(publicationId, articleId, draft)
                ),
            }))
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                dispatch(receiveArticleSubmitError({}))
                throw err
            } else {
                throw err
            }
        }
    }
}

export function deleteArticle(publicationId: string, articleId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        const article = getState().articlesById[articleId]
        dispatch(deleteLocalArticle({id: articleId}))

        try {
            await api.articles.remove(publicationId, articleId)
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                dispatch(undeleteLocalArticle({item: article}))
                console.error(err.message)
            } else {
                throw err
            }
        }
    }
}
