/**
 * ArticlesListPage.ts
 *
 * Created by Zander Otavka on 2/8/17.
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

import {RouteComponentProps} from "react-router"
import {connect} from "react-redux"

import {StateModel} from "./state/models"
import {getPublications, getArticles,
        getArticlesPageTokenForSelectedPublication} from "./state/selectors"
import {reloadArticles, loadNextArticles, deleteArticleById,
        AlreadyLoadingError} from "./state/actions"

import ArticleListView, {StateProps, DispatchProps} from "./ArticleListView"

export interface RouteParams {
    publicationId?: string
}

interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

const withReduxConnect = connect<StateProps, DispatchProps, OwnProps>(
    (state: StateModel, {params}) => ({
        articles: getArticles(state, params),
        publications: getPublications(state),
        currentPublication: state.publicationsById[params.publicationId],
        articlesHaveNextPage: !!getArticlesPageTokenForSelectedPublication(state, params),
    }),

    (dispatch, {params}) => ({
        onRefresh: async () => {
            try {
                await dispatch(reloadArticles(params.publicationId))
            } catch (err) {
                if (AlreadyLoadingError.isTypeOf(err)) {
                    console.error(err.message)
                } else {
                    throw err
                }
            }
        },

        onLoadNextArticlePage: async () => {
            try {
                await dispatch(loadNextArticles(params.publicationId))
            } catch (err) {
                if (AlreadyLoadingError.isTypeOf(err)) {
                    console.error(err.message)
                } else {
                    throw err
                }
            }
        },

        onArticleDelete: id => {
            dispatch(deleteArticleById({id}))
        },
    }),
)

export default withReduxConnect(ArticleListView)
