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

import * as React from "react"
import * as BEMHelper from "react-bem-helper"
import {RouteComponentProps, Link} from "react-router"

import Article from "./Article"
import {ArticleBriefModel, PublicationModel} from "./models"
import api from "./api"

import "./ArticleListPage.scss"

class AlreadyLoadingError extends Error {
    isAlreadyLoadingError: boolean = true
    constructor() {
        super("Already loading.")
    }
}

interface RouteParams {
    publicationId?: string
}

type Props = RouteComponentProps<RouteParams, {}>

interface State {
    articles: ArticleBriefModel[]
    publications: PublicationModel[]
    isLoading: boolean
}

const bem = new BEMHelper("ArticleListPage")

export default class ArticleListPage extends React.PureComponent<Props, State> {
    state: State = {
        articles: [],
        publications: [],
        isLoading: false,
    }

    private publicationsPromise: Promise<PublicationModel[]>

    private async reload(publicationId: string = this.props.params.publicationId): Promise<void> {
        if (this.state.isLoading) {
            throw new AlreadyLoadingError()
        }

        if (publicationId) {
            this.setState({isLoading: true})
            this.setState({
                articles: await api.articles.list(publicationId),
                isLoading: false,
            })
        } else {
            const id = (await this.publicationsPromise)[0].id
            this.props.router.replace(`/publications/${id}/articles`)
        }
    }

    async componentDidMount(): Promise<void> {
        this.publicationsPromise = api.publications.list()
        this.setState({publications: await this.publicationsPromise})
        await this.reload()
    }

    async componentWillReceiveProps({params: nextParams}: Props): Promise<void> {
        const {params: currentParams} = this.props

        if (nextParams.publicationId !== currentParams.publicationId) {
            await this.reload(nextParams.publicationId)
        }
    }

    private onArticleDelete = (id: string): void => {
        api.articles.remove(this.props.params.publicationId, id)

        this.setState(({articles}) => ({
            articles: articles.filter(article => article.id !== id)
        }))
    }

    private onRefresh = async (): Promise<void> => {
        try {
            await this.reload()
        } catch (err) {
            if (!(err as AlreadyLoadingError).isAlreadyLoadingError) {
                throw err
            }
        }
    }

    render(): JSX.Element {
        const {params} = this.props
        const {articles, publications, isLoading} = this.state

        return (
            <div>
                <nav>
                    <ul>
                        {publications.map(publication =>
                            <li key={publication.id}>
                                <Link
                                    to={`/publications/${publication.id}/articles`}
                                    {...bem("publication-link")}
                                    activeClassName={bem("publication-link", "active").className}>

                                    {publication.name}
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>

                <header>
                    <h1>
                        {(publications.length !== 0 && params.publicationId) ? (
                            publications.find(({id}) => id === params.publicationId).name + " "
                        ) : (
                            ""
                        )}

                        Articles
                    </h1>
                </header>

                <main>
                    <Link to={`/publications/${params.publicationId}/articles/new`}>
                        <button>New Article</button>
                    </Link>

                    <button onClick={this.onRefresh}>Refresh</button>

                    {(isLoading) ? (
                        <section {...bem("articles")}>Loading...</section>
                    ) : (
                        <section {...bem("articles")}>
                            {articles.map(article =>
                                <Article
                                    key={article.id} model={article}
                                    onDelete={this.onArticleDelete} />
                            )}
                        </section>
                    )}
                </main>
            </div>
        )
    }
}
