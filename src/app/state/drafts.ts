/**
 * drafts.ts
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
import {hashHistory} from "react-router"

import {IdMapModel, actionCreator, Action, FetchError, API_ROOT, toFetchError,
        arrayToRequest} from "./util"
import {getDrafts, getAuthToken} from "./selectors"
import {FullArticleModel, AuthorModel, ArticleCreateModel, ArticleEditModel,
        loadFullArticle, responseToArticleModel} from "./articles"
import {AuthError, handleAuthError, refreshAuth} from "./auth"
import {createInfoToast} from "./toasts"

// Model

export interface DraftsStateModel {
    readonly articleDraftsById: IdMapModel<ArticleCreateModel>
    readonly submittingDrafts: ReadonlyArray<string>
}

// Actions

export namespace draftsActions {
    type LoadArticleDraftPayload = {publicationId: string, articleId: string}
    export type LoadArticleDraft = Action<LoadArticleDraftPayload>
    export const loadArticleDraft = actionCreator<LoadArticleDraftPayload>("LOAD_ARTICLE_DRAFT")

    type CreateArticleDraftPayload = {id: string, item: ArticleEditModel}
    export const createArticleDraft =
        actionCreator<CreateArticleDraftPayload>("CREATE_ARTICLE_DRAFT")

    type UpdateArticleDraftPayload = {
        id: string,
        update: (draft: ArticleEditModel) => Partial<ArticleEditModel>
    }
    export const updateArticleDraft =
        actionCreator<UpdateArticleDraftPayload>("UPDATE_ARTICLE_DRAFT")

    type DiscardArticleDraftPayload = {id: string}
    export const discardArticleDraft =
        actionCreator<DiscardArticleDraftPayload>("DISCARD_ARTICLE_DRAFT")

    type SubmitArticleDraftPayload = {publicationId: string, articleId: string}
    export type SubmitArticleDraft = Action<SubmitArticleDraftPayload>
    export const submitArticleDraft =
        actionCreator<SubmitArticleDraftPayload>("SUBMIT_ARTICLE_DRAFT")

    type ReceiveArticleSubmitErrorPayload = {id: string}
    export const receiveArticleSubmitError =
        actionCreator<ReceiveArticleSubmitErrorPayload>("RECEIVE_ARTICLE_SUBMIT_ERROR")

    type ReceiveArticleSubmitSuccessPayload = {id: string, item: FullArticleModel, isNew: boolean}
    export const receiveArticleSubmitSuccess =
        actionCreator<ReceiveArticleSubmitSuccessPayload>("RECEIVE_ARTICLE_SUBMIT_SUCCESS")
}

// Reducers

const emptyDraft: ArticleCreateModel = {
    title: "",
    content: "",
    authors: [{name: "", email: ""}],
    headerImage: "",
}

function articleDraftsByIdReducer(state: IdMapModel<ArticleCreateModel> = {},
                                  action: Action<any>): IdMapModel<ArticleCreateModel> {
    if (draftsActions.createArticleDraft.isTypeOf(action)) {
        const {id, item} = action.payload
        if (item) {
            const {title, authors, content, headerImage} = item
            const newDraft = {...emptyDraft, title, authors, content, headerImage}
            return {...state, [id]: newDraft}
        } else {
            return {...state, [id]: emptyDraft}
        }
    }

    if (draftsActions.updateArticleDraft.isTypeOf(action)) {
        const {id, update} = action.payload
        return {...state, [id || ""]: {...state[id || ""], ...update(state[id || ""])}}
    }

    if (draftsActions.discardArticleDraft.isTypeOf(action)) {
        const {id} = action.payload
        const {[id || ""]: _, ...newState} = state
        return newState
    }

    if (draftsActions.receiveArticleSubmitSuccess.isTypeOf(action)) {
        const {item, isNew} = action.payload
        const {[isNew ? "" : item.id]: _, ...newState} = state
        return newState
    }

    return state
}

function submittingDraftsReducer(state: ReadonlyArray<string> = [],
                                 action: Action<any>): ReadonlyArray<string> {
    if (draftsActions.submitArticleDraft.isTypeOf(action)) {
        const {articleId} = action.payload
        return [...state, articleId]
    }

    if (draftsActions.receiveArticleSubmitSuccess.isTypeOf(action) ||
        draftsActions.receiveArticleSubmitError.isTypeOf(action)) {

        const {id} = action.payload
        return state.filter((draftId) => draftId !== id)
    }

    return state
}

export const draftsReducer = combineReducers<DraftsStateModel>({
    articleDraftsById: articleDraftsByIdReducer,
    submittingDrafts: submittingDraftsReducer,
})

// Saga Helpers

function authorModelToRequest(model: AuthorModel): any {
    const {name, email} = model
    return {name, email}
}

function articleEditModelToRequest(model: ArticleEditModel): any {
    const {content, title, authors, headerImage} = model
    return {
        authors: arrayToRequest(authorModelToRequest, authors),
        content, title, headerImage,
    }
}

async function createArticle(
    publicationId: string,
    model: ArticleCreateModel,
    authToken: string
): Promise<FullArticleModel> {
    try {
        const headers = new Headers()
        headers.append("Authorization", authToken)

        const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
            method: "POST",
            mode: "cors",
            headers,
            body: JSON.stringify(articleEditModelToRequest(model)),
        })

        if (!resp.ok) {
            throw new FetchError("", {resp})
        }

        return responseToArticleModel(await resp.json())
    } catch (err) {
        throw toFetchError(err)
    }
}

async function editArticle(
    publicationId: string,
    articleId: string,
    model: ArticleEditModel,
    authToken: string
): Promise<FullArticleModel> {
    try {
        const headers = new Headers()
        headers.append("Authorization", authToken)

        const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                    `${articleId}`, {
            method: "PATCH",
            mode: "cors",
            headers,
            body: JSON.stringify(articleEditModelToRequest(model)),
        })

        if (!resp.ok) {
            throw new FetchError("", {resp})
        }

        return responseToArticleModel(await resp.json())
    } catch (err) {
        throw toFetchError(err)
    }
}

// Sagas

function* loadArticleDraftsSaga(): Iterator<Effect> {
    while (true) {
        const action: any = yield take(draftsActions.loadArticleDraft.type)
        yield fork(function* (loadAction: draftsActions.LoadArticleDraft): Iterator<Effect> {
            const {publicationId, articleId} = loadAction.payload

            const {articleDraftsById}: DraftsStateModel = yield select(getDrafts)
            const savedDraft = articleDraftsById[articleId]

            try {
                const item: FullArticleModel = (savedDraft) ? (
                    savedDraft
                ) : (
                    yield call(loadFullArticle, publicationId, articleId)
                )

                yield put(draftsActions.createArticleDraft({id: articleId, item}))
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

function* submitArticleDraftSaga(): Iterator<Effect> {
    while (true) {
        const action: any = yield take(draftsActions.submitArticleDraft.type)
        yield fork(function* (submitAction: draftsActions.SubmitArticleDraft): Iterator<Effect> {
            const {publicationId, articleId} = submitAction.payload
            const {articleDraftsById}: DraftsStateModel = yield select(getDrafts)
            const savedToken: string = yield select(getAuthToken)
            const draft = articleDraftsById[articleId || ""]
            const isNew = !articleId

            if (!savedToken) {
                yield spawn(createInfoToast,
                            `You must be signed in to ${isNew ? "create" : "edit"} articles.`)
            } else {
                try {
                    yield call(refreshAuth)
                    const token: string = yield select(getAuthToken)

                    const item: FullArticleModel = (isNew) ? (
                        yield call(createArticle, publicationId, draft, token)
                    ) : (
                        yield call(editArticle, publicationId, articleId, draft, token)
                    )

                    yield put(draftsActions.receiveArticleSubmitSuccess({id: item.id, item, isNew}))
                    hashHistory.goBack()
                } catch (err) {
                    if (FetchError.isTypeOf(err)) {
                        yield spawn(createInfoToast, "There was a problem submitting your article.")
                        yield put(draftsActions.receiveArticleSubmitError({id: articleId}))
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

function* discardArticleDraftSaga(): Iterator<Effect> {
    while (true) {
        yield take(draftsActions.discardArticleDraft.type)
        hashHistory.goBack()
    }
}

export function* draftsSaga(): Iterator<Effect> {
    yield all([
        call(loadArticleDraftsSaga),
        call(submitArticleDraftSaga),
        call(discardArticleDraftSaga),
    ])
}
