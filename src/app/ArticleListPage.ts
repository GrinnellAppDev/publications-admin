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

import {connect} from "react-redux"

import {StateModel} from "./state/store"
import {getPublicationsList, getArticlesList,
        getArticlesPageTokenForSelectedPublication} from "./state/selectors"
import {articlesActions} from "./state/articles"
import {PaginatedArray} from "./state/api"

import ArticleListView, {StateProps, DispatchProps, OwnProps} from "./ArticleListView"

export default connect<StateProps, DispatchProps, OwnProps>(
    (state: StateModel, {params}) => ({
        articles: getArticlesList(state, params),
        publications: getPublicationsList(state),
        currentPublication: state.publications.publicationsById[params.publicationId],
        articlesHaveNextPage: getArticlesPageTokenForSelectedPublication(state, params) !==
            PaginatedArray.LAST_PAGE_TOKEN,
        isLoading: state.articles.loadingPublications.includes(params.publicationId),
    }),

    (dispatch, {params}) => ({
        onRefresh: () => {
            dispatch(articlesActions.refreshArticles({publicationId: params.publicationId}))
        },

        onLoadNextArticlePage: () => {
            dispatch(articlesActions.loadNextArticles({publicationId: params.publicationId}))
        },

        onArticleDelete: (id) => {
            dispatch(articlesActions.deleteArticle({id}))
        },
    }),
)(
    ArticleListView
)
