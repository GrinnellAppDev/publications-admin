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
import {Router, Route, IndexRoute, hashHistory} from "react-router"
import {Provider} from "react-redux"
import {createStore, combineReducers, applyMiddleware} from "redux"
import {syncHistoryWithStore, routerReducer, routerMiddleware} from "react-router-redux"
import thunk from "redux-thunk"
import {composeWithDevTools} from "redux-devtools-extension/developmentOnly"

import * as reducers from "./state/reducers"
import {api} from "./state/api"
import {ThunkContext, maybeDoInitialLoad, loadArticles, loadFullArticle} from "./state/actions"
import {StateModel} from "./state/models"

import AppShell from "./AppShell"
import ArticleListPage from "./ArticleListPage"
import ArticleEditPage from "./ArticleEditPage"
import IndexPage from "./IndexPage"
import NotFoundPage from "./NotFoundPage"

const thunkContext: ThunkContext = {api}

const store = createStore(
    combineReducers<StateModel>({
        ...reducers,
        routing: routerReducer,
    }),
    composeWithDevTools(
        applyMiddleware(
            routerMiddleware(hashHistory),
            thunk.withExtraArgument(thunkContext),
        ),
    ),
)

export default function App(): JSX.Element {
    return (
        <Provider store={store}>
            <Router history={syncHistoryWithStore(hashHistory, store)}>
                <Route path="/" component={AppShell}>
                    <IndexRoute
                        component={IndexPage}
                        onEnter={() => {
                            store.dispatch(maybeDoInitialLoad())
                        }} />

                    <Route
                        path="publications/:publicationId/articles"
                        onEnter={({params}) => {
                            store.dispatch(maybeDoInitialLoad(params.publicationId))
                        }}
                        onChange={({params: oldParams}, {params}) => {
                            const {publicationId} = params
                            if (oldParams.publicationId !== publicationId) {
                                store.dispatch(loadArticles(publicationId))
                            }
                        }}>

                        <IndexRoute component={ArticleListPage} />
                        <Route path="new" component={ArticleEditPage} />
                        <Route
                            path=":articleId/edit"
                            component={ArticleEditPage}
                            onEnter={({params}) => {
                                store.dispatch(loadFullArticle(params.publicationId,
                                                               params.articleId))
                            }}
                            onChange={({params: oldParams}, {params}) => {
                                const {publicationId, articleId} = params
                                if (oldParams.publicationId !== publicationId ||
                                    oldParams.articleId !== articleId) {

                                    store.dispatch(loadFullArticle(publicationId, articleId))
                                }
                            }} />
                    </Route>

                    <Route path="*" component={NotFoundPage} />
                </Route>
            </Router>
        </Provider>
    )
}
