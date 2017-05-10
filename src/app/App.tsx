/**
 * App.tsx
 *
 * Created by Zander Otavka on 1/16/17.
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

import * as React from "react"
import {Router, Route, IndexRoute, hashHistory, RouterState} from "react-router"
import {Provider} from "react-redux"
import {createStore, combineReducers, applyMiddleware} from "redux"
import {composeWithDevTools} from "redux-devtools-extension/developmentOnly"
import createSagaMiddleware from "redux-saga"

import {StateModel} from "./state/models"
import * as reducers from "./state/reducers"
import * as actions from "./state/actions"
import saga from "./state/saga"

import AppShell from "./AppShell"
import ArticleListPage from "./ArticleListPage"
import ArticleEditPage from "./ArticleEditPage"
import IndexPage from "./IndexPage"
import NotFoundView from "./NotFoundView"

const sagaMiddleware = createSagaMiddleware()

const store = createStore<StateModel>(
    combineReducers(reducers),
    composeWithDevTools<StateModel>(
        applyMiddleware(
            sagaMiddleware,
        ),
    ),
)

sagaMiddleware.run(saga)

function onPublicationChange({params: oldParams}: RouterState, {params}: RouterState): void {
    const {publicationId} = params
    if (oldParams.publicationId !== publicationId) {
        store.dispatch(actions.selectPublication({publicationId}))
    }
}

function onPublicationEnter(routerState: RouterState): void {
    onPublicationChange({...routerState, params: {}}, routerState)
}

async function onNewArticleNavTo(): Promise<void> {
    const id = ""
    const item = store.getState().articleDraftsById[id]
    await store.dispatch(actions.createArticleDraft({id, item}))
}

async function onArticleChange({params: oldParams}: RouterState,
                               {params}: RouterState): Promise<void> {
    const {publicationId, articleId} = params
    if (oldParams.publicationId !== publicationId ||
        oldParams.articleId !== articleId) {

        store.dispatch(actions.loadArticleDraft({publicationId, articleId}))
    }
}

async function onArticleEnter(routerState: RouterState): Promise<void> {
    await onArticleChange({...routerState, params: {}}, routerState)
}

export default function App(): JSX.Element {
    return (
        <Provider store={store}>
            <Router history={hashHistory}>
                <Route path="/" component={AppShell}>
                    <IndexRoute
                        component={IndexPage}
                        onEnter={onPublicationEnter}
                    />

                    <Route
                        path="publications/:publicationId/articles"
                        onEnter={onPublicationEnter}
                        onChange={onPublicationChange}
                    >
                        <IndexRoute component={ArticleListPage}/>
                        <Route
                            path="new"
                            component={ArticleEditPage}
                            onEnter={onNewArticleNavTo}
                            onChange={onNewArticleNavTo}
                        />
                        <Route
                            path=":articleId/edit"
                            component={ArticleEditPage}
                            onEnter={onArticleEnter}
                            onChange={onArticleChange}
                        />
                    </Route>

                    <Route path="*" component={NotFoundView}/>
                </Route>
            </Router>
        </Provider>
    )
}
