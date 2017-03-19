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
import {syncHistoryWithStore, routerMiddleware} from "react-router-redux"
import thunk from "redux-thunk"
import {composeWithDevTools} from "redux-devtools-extension/developmentOnly"

import {StateModel} from "./state/models"
import * as reducers from "./state/reducers"
import * as actions from "./state/actions"
import {api} from "./state/api"

import AppShell from "./AppShell"
import ArticleListPage from "./ArticleListPage"
import ArticleEditPage from "./ArticleEditPage"
import IndexPage from "./IndexPage"
import NotFoundView from "./NotFoundView"

const thunkContext: actions.ThunkContext = {api}

const store = createStore(
    combineReducers<StateModel>(reducers),
    composeWithDevTools<StateModel>(
        applyMiddleware(
            routerMiddleware(hashHistory),
            thunk.withExtraArgument(thunkContext),
        ),
    ),
)

async function onPublicationChange({params: oldParams}: RouterState,
                                   {params}: RouterState): Promise<void> {
    const {publicationId} = params
    if (oldParams.publicationId !== publicationId) {
        await store.dispatch(actions.loadArticles(publicationId))
    }
}

async function onPublicationEnter({params}: RouterState): Promise<void> {
    await store.dispatch(actions.maybeDoInitialLoad(params.publicationId))
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

        const item = store.getState().articleDraftsById[articleId] ||
                     await store.dispatch(actions.loadFullArticle(publicationId, articleId))
        await store.dispatch(actions.createArticleDraft({id: articleId, item}))
    }
}

async function onArticleEnter(routerState: RouterState): Promise<void> {
    await onArticleChange({...routerState, params: {}}, routerState)
}

export default function App(): JSX.Element {
    return (
        <Provider store={store}>
            <Router history={syncHistoryWithStore(hashHistory, store)}>
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
