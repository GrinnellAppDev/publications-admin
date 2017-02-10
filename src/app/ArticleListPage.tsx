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

import * as React from "react";
import {RouteComponentProps, Link} from "react-router";

import Article from "./Article";
import {ArticleModel, PublicationModel} from "./models";
import api from "./api";
import {pageRootStyle} from "./sharedStyles";

class NoPublicationError extends Error {
    constructor() {
        super("No publication id.");
    }
}

class AlreadyLoadingError extends Error {
    constructor() {
        super("Already loading.");
    }
}

interface RouteParams {
    publicationId?: string;
}

type Props = RouteComponentProps<RouteParams, {}>;

interface State {
    articles: ArticleModel[];
    publications: PublicationModel[];
    isLoading: boolean;
}

export default class ArticleListPage extends React.PureComponent<Props, State> {
    state: State = {
        articles: [],
        publications: [],
        isLoading: false,
    };

    private async reload(): Promise<void> {
        if (this.state.isLoading) {
            throw new AlreadyLoadingError();
        }

        const {params} = this.props;

        if (params.publicationId) {
            this.setState({isLoading: true});
            const articles = await api.articles.list(this.props.params.publicationId);
            this.setState({articles, isLoading: false});
        } else {
            throw new NoPublicationError();
        }
    }

    async componentDidMount(): Promise<void> {
        const {router} = this.props;

        const publications = await api.publications.list();
        this.setState({publications});

        try {
            await this.reload();
        } catch (err) {
            if (err instanceof NoPublicationError) {
                const id = publications[0].id;
                router.replace(`/publications/${id}/articles`);
                await this.reload();
            }
        }
    }

    private onArticleDelete = (id: string): void => {
        api.articles.remove(this.props.params.publicationId, id);

        this.setState(({articles}) => ({
            articles: articles.filter(article => article.id !== id)
        }));
    }

    private onRefresh = async (): Promise<void> => {
        try {
            await this.reload();
        } catch (err) {
            if (!(err instanceof AlreadyLoadingError)) {
                throw err;
            }
        }
    }

    render(): JSX.Element {
        const {params} = this.props;
        const {articles, publications, isLoading} = this.state;

        return (
            <div style={pageRootStyle}>
                <nav>
                    <ul>
                        {publications.map(publication =>
                            <li key={publication.id}>
                                <Link
                                    to={`/publications/${publication.id}/articles`}
                                    activeStyle={{fontWeight: "bold"}}>

                                    {publication.name}
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>

                <header>
                    <h1>
                        {publications.length !== 0 && params.publicationId ?
                            publications.find(({id}) => id === params.publicationId).name + " "
                        :
                            ""
                        }

                        Articles
                    </h1>
                </header>

                <main>
                    <Link to={`/publications/${params.publicationId}/articles/new`}>
                        <button>New Article</button>
                    </Link>

                    <button onClick={this.onRefresh}>Refresh</button>

                    {isLoading ? (
                        <section>Loading...</section>
                    ) : (
                        <section>
                            {articles.map(article =>
                                <Article
                                    key={article.id} model={article}
                                    onDelete={this.onArticleDelete} />
                            )}
                        </section>
                    )}
                </main>
            </div>
        );
    }
}
