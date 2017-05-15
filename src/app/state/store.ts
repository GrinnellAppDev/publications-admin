/**
 * store.ts
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

import {createStore, combineReducers, applyMiddleware} from "redux"
import {composeWithDevTools} from "redux-devtools-extension"
import createSagaMiddleware from "redux-saga"
import {all, call, Effect} from "redux-saga/effects"

import {AuthenticationModel, authReducer, authSaga} from "./auth"
import {ToastModel, toastsReducer} from "./toasts"
import {PublicationsStateModel, publicationsReducer, loadPublicationsSaga} from "./publications"
import {ArticlesStateModel, articlesReducer, articlesSaga} from "./articles"
import {DraftsStateModel, draftsReducer, draftsSaga} from "./drafts"

export interface StateModel {
    readonly auth: AuthenticationModel
    readonly toasts: ReadonlyArray<ToastModel>
    readonly publications: PublicationsStateModel
    readonly articles: ArticlesStateModel
    readonly drafts: DraftsStateModel
}

const rootReducer = combineReducers({
    auth: authReducer,
    toasts: toastsReducer,
    publications: publicationsReducer,
    articles: articlesReducer,
    drafts: draftsReducer,
})

function* rootSaga(): Iterator<Effect> {
    yield all([
        call(authSaga),
        call(loadPublicationsSaga),
        call(articlesSaga),
        call(draftsSaga),
    ])
}

const sagaMiddleware = createSagaMiddleware()

const middlewareDecorator = composeWithDevTools(applyMiddleware(
    sagaMiddleware,
))

export function runSaga(): void {
    sagaMiddleware.run(rootSaga)
}

export default (initialState?: StateModel) =>
    createStore<StateModel>(rootReducer, initialState, middlewareDecorator)
