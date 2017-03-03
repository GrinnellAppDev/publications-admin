/**
 * ArticleListView.tsx
 *
 * Created by Zander Otavka on 2/17/17.
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
import {Link} from "react-router"
import FlipMove from "react-flip-move"

import {ArticleBriefModel, PublicationModel} from "./state/models"
import ArticleView from "./ArticleView"
import block from "./style/bem"

import "./ArticleListView.scss"

export interface StateProps {
    articles: ArticleBriefModel[]
    publications: PublicationModel[]
    currentPublication: PublicationModel
    isLoading: boolean
}

export interface DispatchProps {
    onRefresh: () => void
    onArticleDelete: (id: string) => void
}

type Props = StateProps & DispatchProps

export default function ArticleListView({articles, publications, currentPublication, isLoading,
                                         ...dispatchProps}: Props): JSX.Element {
    const b = block("ArticleListView")

    return (
        <div>
            <nav>
                <ul>
                    {publications.map(publication =>
                        <li key={publication.id}>
                            <Link
                                to={`/publications/${publication.id}/articles`}
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
                    <Link to={`/publications/${currentPublication.id}/articles/new`}>
                        <button>New Article</button>
                    </Link>
                )}

                {(currentPublication) && (
                    <button onClick={dispatchProps.onRefresh}>
                        Refresh
                    </button>
                )}

                {(isLoading || !currentPublication) && (
                    <span> Loading...</span>
                )}

                <section className={b("articles")}>
                    <FlipMove enterAnimation="fade" leaveAnimation="fade">
                        {articles.map(article =>
                            <div key={article.id}>
                                <ArticleView
                                    model={article}
                                    onDelete={dispatchProps.onArticleDelete}
                                />
                            </div>
                        )}
                    </FlipMove>
                </section>
            </main>
        </div>
    )
}
