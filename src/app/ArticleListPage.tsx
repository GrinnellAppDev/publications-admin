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
import {ArticleModel} from "./models";
import api from "./api";

interface RouteParams {
    publicationId: string;
}

type Props = RouteComponentProps<RouteParams, {}>;

interface State {
    articles: ArticleModel[];
}

export default class ArticleListPage extends React.PureComponent<Props, State> {
    state: State = {
        articles: []
    };

    private reload(): Promise<void> {
        return api.articles.list(this.props.params.publicationId).then(articles => {
            this.setState({articles});
        });
    }

    componentDidMount(): void {
        this.reload();
    }

    private onArticleDelete = (id: string): void => {
        api.articles.remove(this.props.params.publicationId, id);

        this.setState(({articles}) => ({
            articles: articles.filter(article => article.id !== id)
        }));
    }

    render(): JSX.Element {
        const {params} = this.props;
        const {articles} = this.state;

        return (
            <div>
                <h1>Articles</h1>
                <main>
                    <Link to={`/publications/${params.publicationId}/articles/new`}>
                        <button>New Article</button>
                    </Link>

                    <section>
                        {articles.map(article =>
                            <Article
                                key={article.id} model={article}
                                onDelete={this.onArticleDelete} />
                        )}
                    </section>
                </main>
            </div>
        );
    }
}
