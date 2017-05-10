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

import {StateModel, FullArticleModel, PublicationModel} from "./models"
import {getDefaultPublicationId} from "./selectors"
import * as actions from "./actions"
import api, {PaginatedArray} from "./api"

function* loadFullArticle(publicationId: string, articleId: string): Iterator<Effect> {
    const item: FullArticleModel = yield call(api.articles.get, publicationId, articleId)
    yield put(actions.recieveFullArticle({item}))
    return item
}

function* loadArticleDrafts(): Iterator<Effect> {
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

function* initialLoad(): Iterator<Effect> {
    const selectAction: actions.SelectPublication = yield take(actions.selectPublication.type)
    const {publicationId} = selectAction.payload

    let pageToken: string
    do {
        yield put(actions.startLoadingPublications({}))
        const page: PaginatedArray<PublicationModel> = yield call(api.publications.list, pageToken)
        yield put(actions.receivePublications({page}))

        pageToken = page.nextPageToken
    } while (pageToken)

    if (publicationId) {
        // reload articles
    } else {
        const defaultPublicationId: string = yield select(getDefaultPublicationId)
        hashHistory.replace(`/publications/${defaultPublicationId}/articles`)
    }
}

export default function* rootSaga(): Iterator<Effect> {
    yield all([
        call(initialLoad),
        call(loadArticleDrafts),
    ])
}
