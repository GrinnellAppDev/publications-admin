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

import {Action as BaseAction} from "redux"

import {PublicationModel, ShortArticleModel, ArticleEditModel, FullArticleModel,
        ToastModel} from "./models"
import {PaginatedArray} from "./api"

export interface Action<T> extends BaseAction {
    readonly type: string
    readonly payload: T
}

interface ActionCreator<T> {
    (payload: T): Action<T>
    isTypeOf(action: Action<any>): action is Action<T>
    type: string
}

function actionCreator<T>(type: string): ActionCreator<T> {
    return Object.assign(
        (payload: T): Action<T> => ({type, payload}),
        {
            isTypeOf: (action: any): action is Action<T> => action.type === type,
            type,
        },
    )
}

type SignInPayload = {username: string, password: string}
export type SignIn = Action<SignInPayload>
export const signIn = actionCreator<SignInPayload>("SIGN_IN")

type SignOutPayload = {}
export type SignOut = Action<SignOutPayload>
export const signOut = actionCreator<SignOutPayload>("SIGN_OUT")

type SaveAuthInfoPayload = {username: string, token: string}
export const saveAuthInfo = actionCreator<SaveAuthInfoPayload>("SAVE_AUTH_INFO")

type ReceiveAuthErrorPayload = {}
export const receiveAuthError = actionCreator<ReceiveAuthErrorPayload>("RECEIVE_AUTH_ERROR")

type SelectPublicationPayload = {publicationId: string}
export type SelectPublication = Action<SelectPublicationPayload>
export const selectPublication = actionCreator<SelectPublicationPayload>("SELECT_PUBLICATION")

type StartLoadingPublicationsPayload = {}
export const startLoadingPublications =
    actionCreator<StartLoadingPublicationsPayload>("START_LOADING_PUBLICATIONS")

type ReceivePublicationsPayload = {page: PaginatedArray<PublicationModel>}
export const receivePublications = actionCreator<ReceivePublicationsPayload>("RECIEVE_PUBLICATIONS")

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
export const recieveFullArticle = actionCreator<ReceiveFullArticlePayload>("RECIEVE_FULL_ARTICLE")

type DeleteArticlePayload = {id: string}
export type DeleteArticle = Action<DeleteArticlePayload>
export const deleteArticle = actionCreator<DeleteArticlePayload>("DELETE_ARTICLE")

type DeleteLocalArticlePayload = {id: string}
export const deleteLocalArticle = actionCreator<DeleteLocalArticlePayload>("DELETE_LOCAL_ARTICLE")

type UndeleteArticlePayload = {item: ShortArticleModel}
export const undeleteArticle = actionCreator<UndeleteArticlePayload>("UNDELETE_ARTICLE")

type LoadArticleDraftPayload = {publicationId: string, articleId: string}
export type LoadArticleDraft = Action<LoadArticleDraftPayload>
export const loadArticleDraft = actionCreator<LoadArticleDraftPayload>("LOAD_ARTICLE_DRAFT")

type CreateArticleDraftPayload = {id: string, item: ArticleEditModel}
export const createArticleDraft = actionCreator<CreateArticleDraftPayload>("CREATE_ARTICLE_DRAFT")

type UpdateArticleDraftPayload = {
    id: string,
    update: (draft: ArticleEditModel) => Partial<ArticleEditModel>
}
export const updateArticleDraft = actionCreator<UpdateArticleDraftPayload>("UPDATE_ARTICLE_DRAFT")

type DiscardArticleDraftPayload = {id: string}
export const discardArticleDraft =
    actionCreator<DiscardArticleDraftPayload>("DISCARD_ARTICLE_DRAFT")

type SubmitArticleDraftPayload = {publicationId: string, articleId: string}
export type SubmitArticleDraft = Action<SubmitArticleDraftPayload>
export const submitArticleDraft = actionCreator<SubmitArticleDraftPayload>("SUBMIT_ARTICLE_DRAFT")

type ReceiveArticleSubmitErrorPayload = {}
export const receiveArticleSubmitError =
    actionCreator<ReceiveArticleSubmitErrorPayload>("RECEIVE_ARTICLE_SUBMIT_ERROR")

type ReceiveArticleSubmitSuccessPayload = {item: FullArticleModel, isNew: boolean}
export const receiveArticleSubmitSuccess =
    actionCreator<ReceiveArticleSubmitSuccessPayload>("RECEIVE_ARTICLE_SUBMIT_SUCCESS")

type CreateToastPayload = {item: ToastModel}
export const createToast = actionCreator<CreateToastPayload>("CREATE_TOAST")

type CloseToastPayload = {toastId: string, buttonId?: string}
export type CloseToast = Action<CloseToastPayload>
export const closeToast = actionCreator<CloseToastPayload>("CLOSE_TOAST")
