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
import {RouteComponentProps} from "react-router";

import Article, {ArticleModel} from "./Article";

interface RouteParams {
}

type Props = RouteComponentProps<RouteParams, {}>;

interface State {
    articles: ArticleModel[];
}

export default class ArticleListPage extends React.PureComponent<Props, State> {
    state: State = {
        articles: [
            {
                id: "a",
                publicationId: "s&b",
                content: "I am an article",
                title: "My Article",
            },
            {
                id: "b",
                publicationId: "s&b",
                content: "I am a different, sensationalist article",
                title: "Badly Written Article",
            }
        ]
    };

    private onLinkClick = (ev: React.MouseEvent<HTMLAnchorElement>): void => {
        ev.preventDefault();
        this.props.router.push(ev.currentTarget.href);
    }

    private onArticleDelete = (id: string): void => {
        this.setState(({articles}) => ({
            articles: articles.filter(article => article.id !== id)
        }));
    }

    render(): JSX.Element {
        const {articles} = this.state;

        return (
            <div>
                <h1>Articles</h1>
                <main>
                    <a href="#/articles/new" onClick={this.onLinkClick}>
                        New Article
                    </a>
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
