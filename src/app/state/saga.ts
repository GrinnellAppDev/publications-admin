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
import {all, call, fork, spawn, cancel, take, select, put, Effect} from "redux-saga/effects"
import {hashHistory} from "react-router"
import {v4 as uuid} from "uuid"

import {StateModel, ShortArticleModel, FullArticleModel, PublicationModel,
        ToastModel} from "./models"
import {getDefaultPublicationId} from "./selectors"
import * as actions from "./actions"
import api, {FetchError, PaginatedArray} from "./api"

function* loadFullArticle(publicationId: string, articleId: string): Iterator<Effect> {
    const item: FullArticleModel = yield call(api.articles.get, publicationId, articleId)
    yield put(actions.recieveFullArticle({item}))
    return item
}

function* createToast(item: ToastModel, duration: number = 4000): Iterator<Effect> {
    yield put(actions.createToast({item}))
    const delayTask: Task = yield fork(function* (): Iterator<Effect> {
        yield call(delay, duration)
        yield put(actions.closeToast({toastId: item.id}))
    })

    const closeAction: actions.CloseToast = yield take((action: any) =>
        actions.closeToast.isTypeOf(action) && action.payload.toastId === item.id
    )
    const {buttonId} = closeAction.payload

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

    return yield call(createToast, item, duration)
}

function* initialLoad(): Iterator<Effect> {
    const selectAction: actions.SelectPublication = yield take(actions.selectPublication.type)
    const {publicationId} = selectAction.payload

    let pageToken: string | null = null
    while (pageToken !== PaginatedArray.LAST_PAGE_TOKEN) {
        yield put(actions.startLoadingPublications({}))
        const page: PaginatedArray<PublicationModel> = yield call(api.publications.list, pageToken)
        yield put(actions.receivePublications({page}))

        pageToken = page.nextPageToken
    }

    if (!publicationId) {
        const defaultPublicationId: string = yield select(getDefaultPublicationId)
        hashHistory.replace(`/publications/${defaultPublicationId}/articles`)
    }
}

function* handleRefreshArticles(): Iterator<Effect> {
    while (true) {
        const refreshAction: actions.RefreshArticles = yield take(actions.refreshArticles.type)
        const {publicationId} = refreshAction.payload
        const page: PaginatedArray<ShortArticleModel> =
            yield call(api.articles.list, publicationId, null)

        yield put(actions.clearArticles({publicationId}))
        yield put(actions.receiveArticles({publicationId, page}))
    }
}

function* handleLoadNextArticles(): Iterator<Effect> {
    while (true) {
        const loadAction: actions.LoadNextArticles = yield take(actions.loadNextArticles.type)
        const {publicationId} = loadAction.payload
        const {articlesPageTokensByParentId}: StateModel = yield select()
        const pageToken = articlesPageTokensByParentId[publicationId]

        const page: PaginatedArray<ShortArticleModel> =
            yield call(api.articles.list, publicationId, pageToken)

        yield put(actions.receiveArticles({publicationId, page}))
    }
}

function* handleLoadArticleDrafts(): Iterator<Effect> {
    while (true) {
        const loadAction: actions.LoadArticleDraft = yield take(actions.loadArticleDraft.type)
        const {publicationId, articleId} = loadAction.payload

        const {articleDraftsById}: StateModel = yield select()
        const savedDraft = articleDraftsById[articleId]
        const item: FullArticleModel = (savedDraft) ? (
            savedDraft
        ) : (
            yield call(loadFullArticle, publicationId, articleId)
        )

        yield put(actions.createArticleDraft({id: articleId, item}))
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

                const buttonId: string = yield call(createToast, {
                    id: uuid(),
                    text: `Deleting "${title}"`,
                    buttons: [undoButton, {id: uuid(), text: "Close"}]
                })

                if (buttonId === undoButton.id) {
                    yield put(actions.undeleteArticle({item: article}))
                } else {
                    try {
                        yield call(api.articles.remove, article.publication, article.id, auth.token)
                    } catch (err) {
                        if (FetchError.isTypeOf(err)) {
                            yield spawn(createInfoToast,
                                        "There was a problem deleting the article.")
                            yield put(actions.undeleteArticle({item: article}))
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
        call(initialLoad),
        call(handleRefreshArticles),
        call(handleLoadNextArticles),
        call(handleLoadArticleDrafts),
        call(handleDeleteArticle),
    ])
}
