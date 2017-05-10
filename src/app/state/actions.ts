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

import {PublicationModel, ShortArticleModel, ArticleEditModel, FullArticleModel, ToastModel,
        StateModel} from "./models"
import api, {PaginatedArray} from "./api"
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
            isTypeOf: (action: any): action is SyncAction<T> => action.type === type,
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

type LoadNextArticlesPayload = {publicationId: string}
export type LoadNextArticles = SyncAction<LoadNextArticlesPayload>
export const loadNextArticles =
    createSyncActionCreator<LoadNextArticlesPayload>("LOAD_NEXT_ARTICLES")

type ReceiveArticlesPayload = {publicationId: string, page: PaginatedArray<ShortArticleModel>}
export const receiveArticles =
    createSyncActionCreator<ReceiveArticlesPayload>("RECIEVE_ARTICLES")

type ClearArticlesPayload = {publicationId: string}
export const clearArticles =
    createSyncActionCreator<ClearArticlesPayload>("CLEAR_ARTICLES")

type RefreshArticlesPayload = {publicationId: string}
export type RefreshArticles = SyncAction<RefreshArticlesPayload>
export const refreshArticles =
    createSyncActionCreator<RefreshArticlesPayload>("REFRESH_ARTICLES")

type LoadFullArticlePayload = {publicationId: string, articleId: string}
export type LoadFullArticle = SyncAction<LoadFullArticlePayload>
export const loadFullArticle =
    createSyncActionCreator<LoadFullArticlePayload>("LOAD_FULL_ARTICLE")

type ReceiveFullArticlePayload = {item: FullArticleModel}
export const recieveFullArticle =
    createSyncActionCreator<ReceiveFullArticlePayload>("RECIEVE_FULL_ARTICLE")

type DeleteArticlePayload = {id: string}
export type DeleteArticle = SyncAction<DeleteArticlePayload>
export const deleteArticle =
    createSyncActionCreator<DeleteArticlePayload>("DELETE_ARTICLE")

type DeleteLocalArticlePayload = {id: string}
export const deleteLocalArticle =
    createSyncActionCreator<DeleteLocalArticlePayload>("DELETE_LOCAL_ARTICLE")

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

type SubmitArticleDraftPayload = {publicationId: string, articleId: string}
export type SubmitArticleDraft = SyncAction<SubmitArticleDraftPayload>
export const submitArticleDraft =
    createSyncActionCreator<SubmitArticleDraftPayload>("SUBMIT_ARTICLE_DRAFT")

type ReceiveArticleSubmitErrorPayload = {}
export const receiveArticleSubmitError =
    createSyncActionCreator<ReceiveArticleSubmitErrorPayload>("RECEIVE_ARTICLE_SUBMIT_ERROR")

type ReceiveArticleSubmitSuccessPayload = {item: FullArticleModel, isNew: boolean}
export const receiveArticleSubmitSuccess =
    createSyncActionCreator<ReceiveArticleSubmitSuccessPayload>("RECEIVE_ARTICLE_SUBMIT_SUCCESS")

type CreateToastPayload = {item: ToastModel}
export const createToast =
    createSyncActionCreator<CreateToastPayload>("CREATE_TOAST")

type CloseToastPayload = {toastId: string, buttonId?: string}
export type CloseToast = SyncAction<CloseToastPayload>
export const closeToast =
    createSyncActionCreator<CloseToastPayload>("CLOSE_TOAST")


export const AlreadyLoadingError = createErrorClass<void>(
    "ALREADY_LOADING_ERROR",
    (message) => `Cannot load. ${message}`,
)
