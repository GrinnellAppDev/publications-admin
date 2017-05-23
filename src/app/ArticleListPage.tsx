/**
 * ArticlesListPage.tsx
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

import React from "react"
import {connect} from "react-redux"
import {Link, RouteComponentProps} from "react-router"
import FlipMove from "react-flip-move"
import InfiniteScroller from "react-infinite-scroller"

import {StateModel} from "./state/store"
import {getPublicationsList, getArticlesList,
        getArticlesPageTokenForSelectedPublication} from "./state/selectors"
import {articlesActions} from "./state/articles"
import {PaginatedArray} from "./state/util"
import {PublicationModel} from "./state/publications"
import {ShortArticleModel} from "./state/articles"

import Article from "./Article"

import block from "./style/bem"
import "./ArticleListPage.scss"

interface StateProps {
    articles: ShortArticleModel[]
    publications: PublicationModel[]
    currentPublication: PublicationModel
    articlesHaveNextPage: boolean
    isLoading: boolean
}

interface DispatchProps {
    onRefresh: () => void
    onLoadNextArticlePage: () => void
    onArticleDelete: (id: string) => void
}

interface RouteParams {
    publicationId?: string
}

interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

const b = block("ArticleListPage")

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
)
(function ArticleListPage({currentPublication, ...props}) {
    return (
        <div>
            <nav>
                <ul>
                    {props.publications.map((publication) =>
                        <li key={publication.id}>
                            <Link
                                to={`/${publication.id}`}
                                className={b("publication-link")}
                                activeClassName={b("publication-link", "active")}
                            >

                                {publication.name}
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>

            <header>
                <h1>
                    {currentPublication && currentPublication.name} Articles
                </h1>
            </header>

            <main>
                {(currentPublication) && (
                    <Link to={`/${currentPublication.id}/new-article`}>
                        <button>New Article</button>
                    </Link>
                )}

                {(currentPublication) && (
                    <button onClick={props.onRefresh}>
                        Refresh
                    </button>
                )}

                <span hidden={!props.isLoading}>Loading...</span>

                <InfiniteScroller
                    loadMore={props.onLoadNextArticlePage}
                    hasMore={props.articlesHaveNextPage}
                    loader={<span>Loading...</span>}
                    element="section"
                    className={b("articles")}
                >
                    <FlipMove enterAnimation="fade" leaveAnimation="fade" duration={150}>
                        {props.articles.map((article) =>
                            <div key={article.id}>
                                <Article
                                    model={article}
                                    onDelete={props.onArticleDelete}
                                />
                            </div>
                        )}
                    </FlipMove>
                </InfiniteScroller>
            </main>
        </div>
    )
})
