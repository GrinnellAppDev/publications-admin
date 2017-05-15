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

import React from "react"
import {Router, Route, IndexRoute, hashHistory, RouterState} from "react-router"
import {Provider} from "react-redux"

import createStore, {runSaga} from "./state/store"
import {publicationsActions} from "./state/publications"
import {draftsActions} from "./state/drafts"

import AppShell from "./AppShell"
import ArticleListPage from "./ArticleListPage"
import ArticleEditPage from "./ArticleEditPage"
import IndexPage from "./IndexPage"
import NotFoundPage from "./NotFoundPage"

const store = createStore()
runSaga()

function onPublicationChange({params: oldParams}: RouterState, {params}: RouterState): void {
    const {publicationId} = params
    if (oldParams.publicationId !== publicationId) {
        store.dispatch(publicationsActions.selectPublication({publicationId}))
    }
}

function onPublicationEnter({params}: RouterState): void {
    store.dispatch(publicationsActions.selectPublication({publicationId: params.publicationId}))
}

function onNewArticleNavTo(): void {
    const id = ""
    const item = store.getState().drafts.articleDraftsById[id]
    store.dispatch(draftsActions.createArticleDraft({id, item}))
}

function onArticleChange({params: oldParams}: RouterState,
                         {params}: RouterState): void {
    const {publicationId, articleId} = params
    if (oldParams.publicationId !== publicationId ||
        oldParams.articleId !== articleId) {

        store.dispatch(draftsActions.loadArticleDraft({publicationId, articleId}))
    }
}

function onArticleEnter(routerState: RouterState): void {
    onArticleChange({...routerState, params: {}}, routerState)
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
                        path=":publicationId"
                        onEnter={onPublicationEnter}
                        onChange={onPublicationChange}
                    >
                        <IndexRoute component={ArticleListPage}/>
                        <Route
                            path="new-article"
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

                    <Route path="*" component={NotFoundPage}/>
                </Route>
            </Router>
        </Provider>
    )
}
