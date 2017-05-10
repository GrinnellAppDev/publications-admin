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

import {PublicationModel, ShortArticleModel, ArticleEditModel, FullArticleModel,
        ToastActionTypeModel, StateModel} from "./models"
import api, {FetchError, PaginatedArray} from "./api"
import createErrorClass from "./createErrorClass"

export interface SyncAction<T> extends Action {
    readonly type: string
    readonly payload: T
}

export interface ThunkContext {
    api: typeof api
}

interface BaseThunkAction<T> extends ThunkAction<T, StateModel, ThunkContext> {
}

export interface SyncThunkAction<T> extends BaseThunkAction<SyncAction<T>> {
}

export interface AsyncAction<T> extends BaseThunkAction<Promise<T>> {
}

export type AnyAction = SyncAction<any> | AsyncAction<any>


interface SyncActionCreator<T> {
    (payload: T): SyncAction<T>
    isTypeOf(action: SyncAction<any>): action is SyncAction<T>
    type: string
}

function createSyncActionCreator<T>(type: string): SyncActionCreator<T> {
    return Object.assign(
        (payload: T): SyncAction<T> => ({type, payload}),
        {
            isTypeOf: (action: SyncAction<any>): action is SyncAction<T> => action.type === type,
            type,
        },
    )
}

type SaveAuthInfoPayload = {username: string, token: string}
export const saveAuthInfo =
    createSyncActionCreator<SaveAuthInfoPayload>("SAVE_AUTH_INFO")

type ReceiveAuthErrorPayload = {}
export const receiveAuthError =
    createSyncActionCreator<ReceiveAuthErrorPayload>("RECEIVE_AUTH_ERROR")

type StartInitialLoadPayload = {}
export const startInitialLoad =
    createSyncActionCreator<StartInitialLoadPayload>("START_INITIAL_LOAD")

type SelectPublicationPayload = {publicationId: string}
export type SelectPublication = SyncAction<SelectPublicationPayload>
export const selectPublication =
    createSyncActionCreator<SelectPublicationPayload>("SELECT_PUBLICATION")

type StartLoadingPublicationsPayload = {}
export const startLoadingPublications =
    createSyncActionCreator<StartLoadingPublicationsPayload>("START_LOADING_PUBLICATIONS")

type ReceivePublicationsPayload = {page: PaginatedArray<PublicationModel>}
export const receivePublications =
    createSyncActionCreator<ReceivePublicationsPayload>("RECIEVE_PUBLICATIONS")

type StartLoadingArticlesPayload = {publicationId: string}
export const startLoadingArticles =
    createSyncActionCreator<StartLoadingArticlesPayload>("START_LOADING_ARTICLES")

type ReceiveArticlesPayload = {publicationId: string, page: PaginatedArray<ShortArticleModel>}
export const receiveArticles =
    createSyncActionCreator<ReceiveArticlesPayload>("RECIEVE_ARTICLES")

type LoadFullArticlePayload = {publicationId: string, articleId: string}
export type LoadFullArticle = SyncAction<LoadFullArticlePayload>
export const loadFullArticle =
    createSyncActionCreator<LoadFullArticlePayload>("LOAD_FULL_ARTICLE")

type ReceiveFullArticlePayload = {item: FullArticleModel}
export const recieveFullArticle =
    createSyncActionCreator<ReceiveFullArticlePayload>("RECIEVE_FULL_ARTICLE")

type ClearArticlesPayload = {publicationId: string}
export const clearArticles =
    createSyncActionCreator<ClearArticlesPayload>("CLEAR_ARTICLES")

type DeleteLocalArticlePayload = {item: ShortArticleModel}
export const deleteLocalArticle =
    createSyncActionCreator<DeleteLocalArticlePayload>("DELETE_LOCAL_ARTICLE")

type ReceiveArticleDeleteErrorPayload = {}
export const recieveArticleDeleteError =
    createSyncActionCreator<ReceiveArticleDeleteErrorPayload>("RECEIVE_ARTICLE_DELETE_ERROR")

type UndeleteArticlePayload = {item: ShortArticleModel}
export const undeleteArticle =
    createSyncActionCreator<UndeleteArticlePayload>("UNDELETE_ARTICLE")

type LoadArticleDraftPayload = {publicationId: string, articleId: string}
export type LoadArticleDraft = SyncAction<LoadArticleDraftPayload>
export const loadArticleDraft =
    createSyncActionCreator<LoadArticleDraftPayload>("LOAD_ARTICLE_DRAFT")

type CreateArticleDraftPayload = {id: string, item: ArticleEditModel}
export const createArticleDraft =
    createSyncActionCreator<CreateArticleDraftPayload>("CREATE_ARTICLE_DRAFT")

type UpdateArticleDraftPayload = {
    id: string,
    update: (draft: ArticleEditModel) => Partial<ArticleEditModel>
}
export const updateArticleDraft =
    createSyncActionCreator<UpdateArticleDraftPayload>("UPDATE_ARTICLE_DRAFT")

type DiscardArticleDraftPayload = {id: string}
export const discardArticleDraft =
    createSyncActionCreator<DiscardArticleDraftPayload>("DISCARD_ARTICLE_DRAFT")

type StartSubmittingArticleDraftPayload = {}
export const startSubmittingArticleDraft =
    createSyncActionCreator<StartSubmittingArticleDraftPayload>("START_SUBMITTING_ARTICLE_DRAFT")

type ReceiveArticleSubmitErrorPayload = {}
export const receiveArticleSubmitError =
    createSyncActionCreator<ReceiveArticleSubmitErrorPayload>("RECEIVE_ARTICLE_SUBMIT_ERROR")

type ReceiveArticleSubmitSuccessPayload = {item: FullArticleModel, isNew: boolean}
export const receiveArticleSubmitSuccess =
    createSyncActionCreator<ReceiveArticleSubmitSuccessPayload>("RECEIVE_ARTICLE_SUBMIT_SUCCESS")

type CreateInfoToastPayload = {text: string, duration?: number}
export const createInfoToast =
    createSyncActionCreator<CreateInfoToastPayload>("CREATE_INFO_TOAST")

type CloseToastPayload = {id: string}
export const closeToast =
    createSyncActionCreator<CloseToastPayload>("CLOSE_TOAST")


type MaybeDeleteArticlePayload = DeleteLocalArticlePayload | CreateInfoToastPayload
export const maybeDeleteArticleById =
    ({id}: {id: string}): SyncThunkAction<MaybeDeleteArticlePayload> => (dispatch, getState) =>
        (!getState().auth.token) ? (
            dispatch(createInfoToast({
                text: "You must be signed in to delete articles.",
            }))
        ) : (
            dispatch(deleteLocalArticle({item: getState().articlesById[id]}))
        )


export const AlreadyLoadingError = createErrorClass<void>(
    "ALREADY_LOADING_ERROR",
    (message) => `Cannot load. ${message}`,
)

export function loadNextArticles(publicationId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        if (getState().loadingPublications.includes(publicationId)) {
            throw new AlreadyLoadingError("Already loading articles.")
        }

        const pageToken = getState().articlesPageTokensByParentId[publicationId]
        if (pageToken !== "") {
            dispatch(startLoadingArticles({publicationId}))
            dispatch(receiveArticles({
                publicationId,
                page: await api.articles.list(publicationId, pageToken),
            }))
        }
    }
}

export function reloadArticles(publicationId: string): AsyncAction<void> {
    return async (dispatch) => {
        dispatch(clearArticles({publicationId}))
        await dispatch(loadNextArticles(publicationId))
    }
}

export function submitArticleDraft(publicationId: string, articleId: string): AsyncAction<boolean> {
    return async (dispatch, getState, {api}) => {
        const {auth, articleDraftsById} = getState()
        const draft = articleDraftsById[articleId || ""]
        const isNew = !articleId

        if (!auth.token) {
            const text = `You must be signed in to ${isNew ? "create" : "edit"} articles.`
            dispatch(createInfoToast({text}))

            return false
        } else {
            dispatch(startSubmittingArticleDraft({}))

            try {
                dispatch(receiveArticleSubmitSuccess({
                    isNew,
                    item: (isNew) ? (
                        await api.articles.create(publicationId, draft, auth.token)
                    ) : (
                        await api.articles.edit(publicationId, articleId, draft, auth.token)
                    ),
                }))

                return true
            } catch (err) {
                if (FetchError.isTypeOf(err)) {
                    const {resp} = err.payload
                    dispatch(receiveArticleSubmitError({}))

                    if (resp && resp.status === 401) {
                        dispatch(receiveAuthError({}))
                        dispatch(createInfoToast({text: "Sign in again."}))
                    }
                }

                return false
            }
        }
    }
}

export function deleteRemoteArticle(item: ShortArticleModel): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        const {auth} = getState()

        try {
            await api.articles.remove(item.publication, item.id, auth.token)
        } catch (err) {
            if (FetchError.isTypeOf(err)) {
                dispatch(recieveArticleDeleteError({}))
                dispatch(undeleteArticle({item}))
            } else {
                throw err
            }
        }
    }
}

export const toastActions: {[action: number]: (...args: any[]) => AnyAction} = {
    [ToastActionTypeModel.DELETE_REMOTE_ARTICLE]: deleteRemoteArticle,
    [ToastActionTypeModel.UNDELETE_ARTICLE]: undeleteArticle,
}
