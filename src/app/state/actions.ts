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

import {PublicationModel, ArticleBriefModel, FullArticleModel, StateModel} from "./models"
import {Api, FetchError} from "./api"
import createErrorClass from "./createErrorClass"

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

export const recievePublications =
    createSyncActionCreator<{items: ReadonlyArray<PublicationModel>}>("RECIEVE_PUBLICATIONS")

export const recieveArticles =
    createSyncActionCreator<{items: ReadonlyArray<ArticleBriefModel>}>("RECIEVE_ARTICLES")

export const startLoadingFullArticle =
    createSyncActionCreator<{id: string}>("START_LOADING_FULL_ARTICLE")

export const recieveFullArticle =
    createSyncActionCreator<{item: FullArticleModel}>("RECIEVE_FULL_ARTICLE")

export const clearArticles =
    createSyncActionCreator<void>("CLEAR_ARTICLES")

export const deleteLocalArticle =
    createSyncActionCreator<{id: string}>("DELETE_ARTICLE")

export const undeleteLocalArticle =
    createSyncActionCreator<{item: ArticleBriefModel}>("UNDELETE_ARTICLE")

export function loadPublications(): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        dispatch(recievePublications({
            items: await api.publications.list(),
        }))
    }
}

export const AlreadyLoadingError = createErrorClass<void>(
    "ALREADY_LOADING_ERROR",
    message => `Cannot load. ${message}`,
)

export function loadArticles(publicationId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        if (!getState().isLoadingArticles) {
            dispatch(recieveArticles({
                items: await api.articles.list(publicationId),
            }))
        } else {
            throw new AlreadyLoadingError("Already loading articles.")
        }
    }
}

export function loadFullArticle(publicationId: string, articleId: string): AsyncAction<void> {
    return async (dispatch, getState, {api}) => {
        dispatch(startLoadingFullArticle({id: articleId}))
        dispatch(recieveFullArticle({
            item: await api.articles.get(publicationId, articleId),
        }))
    }
}

export function reloadArticles(publicationId: string): AsyncAction<void> {
    return async dispatch => {
        const articlesLoaded = dispatch(loadArticles(publicationId))
        dispatch(clearArticles(undefined))
        await articlesLoaded
    }
}

export function goToPublication(publicationId: string): AsyncAction<void> {
    return async dispatch => {
        dispatch(replace(`/publications/${publicationId}/articles`))
        await dispatch(reloadArticles(publicationId))
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
            }
        }
    }
}
