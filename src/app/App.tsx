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
import {Router, Route, IndexRoute, hashHistory, RouteComponentProps} from "react-router"
import {Provider} from "react-redux"
import {createStore, combineReducers, applyMiddleware} from "redux"
import {syncHistoryWithStore, routerReducer, routerMiddleware} from "react-router-redux"
import thunk from "redux-thunk"

import * as reducers from "./state/reducers"
import {api} from "./state/api"
import {ThunkContext, loadPublications, goToPublication} from "./state/actions"
import {StateModel} from "./state/models"
import {getPublications} from "./state/selectors"

import AppShell from "./AppShell"
import ArticleListPage, {RouteParams as ArticleListParams} from "./ArticleListPage"
import ArticleEditPage from "./ArticleEditPage"

const thunkContext: ThunkContext = {api}

const store = createStore(
    combineReducers<StateModel>({
        ...reducers,
        routing: routerReducer,
    }),
    applyMiddleware(
        routerMiddleware(hashHistory),
        thunk.withExtraArgument(thunkContext),
    ),
)

interface FetcherProps extends RouteComponentProps<ArticleListParams, {}> {}

class PublicationFetcher extends React.PureComponent<FetcherProps, {}> {
    static get defaultPublicationId(): string {
        const first = getPublications(store.getState())[0]
        return first ? first.id : ""
    }

    async componentDidMount(): Promise<void> {
        await store.dispatch(loadPublications())
        await store.dispatch(goToPublication(
            this.props.params.publicationId || PublicationFetcher.defaultPublicationId
        ))
    }

    async componentWillReceiveProps({params}: FetcherProps): Promise<void> {
        if (!params.publicationId) {
            const defaultPublicationId = PublicationFetcher.defaultPublicationId
            if (defaultPublicationId) {
                await store.dispatch(goToPublication(defaultPublicationId))
            }
        }
    }

    render(): JSX.Element {
        return <div>{this.props.children}</div>
    }
}

function NotFound(): JSX.Element {
    return (
        <div>
            <h1>404 Not Found</h1>
            <a href="#">Home</a>
        </div>
    )
}

export default function App(): JSX.Element {
    return (
        <Provider store={store}>
            <Router history={syncHistoryWithStore(hashHistory, store)}>
                <Route path="/" component={AppShell}>
                    <IndexRoute component={PublicationFetcher} />
                    <Route
                        path="publications/:publicationId/articles"
                        component={PublicationFetcher}>

                        <IndexRoute component={ArticleListPage} />
                        <Route path="new" component={ArticleEditPage} />
                        <Route path=":articleId/edit" component={ArticleEditPage} />
                    </Route>
                    <Route path="*" component={NotFound} />
                </Route>
            </Router>
        </Provider>
    )
}
