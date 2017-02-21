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

import {PublicationModel, ArticleBriefModel, StateModel} from "./models"
import {Api} from "./api"

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
    readonly type: string
}

function makeSyncActionCreator<T>(type: string): SyncActionCreator<T> {
    return Object.assign((payload: T): SyncAction<T> => ({type, payload}), {type})
}

export function actionIsType<T>(action: SyncAction<any>,
                                creator: SyncActionCreator<T>): action is SyncAction<T> {
    return action.type === creator.type
}

interface RecievePublicationsPayload {
    items: ReadonlyArray<PublicationModel>
}

interface SelectPublicationPayload {
    id: string
}

interface RecieveArticlesPayload {
    items: ReadonlyArray<ArticleBriefModel>
}

interface ClearArticlesPayload {
}

interface DeleteArticlePayload {
    id: string
}

export const recievePublications =
    makeSyncActionCreator<RecievePublicationsPayload>("RECIEVE_PUBLICATIONS")

export const selectPublication =
    makeSyncActionCreator<SelectPublicationPayload>("SELECT_PUBLICATION")

export const recieveArticles =
    makeSyncActionCreator<RecieveArticlesPayload>("RECIEVE_ARTICLES")

export const clearArticles =
    makeSyncActionCreator<ClearArticlesPayload>("CLEAR_ARTICLES")

export const deleteArticle =
    makeSyncActionCreator<DeleteArticlePayload>("DELETE_ARTICLE")

export function loadPublications(): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        dispatch(recievePublications({
            items: await api.publications.list(),
        }))
    }
}

export function loadArticles(publicationId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        dispatch(recieveArticles({
            items: await api.articles.list(publicationId),
        }))
    }
}

export function reloadArticles(publicationId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        dispatch(clearArticles({}))
        await dispatch(loadArticles(publicationId))
    }
}

export function goToPublication(publicationId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        dispatch(replace(`/publications/${publicationId}/articles`))
        await dispatch(reloadArticles(publicationId))
    }
}
