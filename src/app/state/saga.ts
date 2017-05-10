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

import {all, call, take, select, put, Effect} from "redux-saga/effects"
import {hashHistory} from "react-router"

import {StateModel, ShortArticleModel, FullArticleModel, PublicationModel} from "./models"
import {getDefaultPublicationId} from "./selectors"
import * as actions from "./actions"
import api, {PaginatedArray} from "./api"

function* loadFullArticle(publicationId: string, articleId: string): Iterator<Effect> {
    const item: FullArticleModel = yield call(api.articles.get, publicationId, articleId)
    yield put(actions.recieveFullArticle({item}))
    return item
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

export default function* rootSaga(): Iterator<Effect> {
    yield all([
        call(initialLoad),
        call(handleRefreshArticles),
        call(handleLoadNextArticles),
        call(handleLoadArticleDrafts),
    ])
}
