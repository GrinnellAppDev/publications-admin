/**
 * ArticleEditPage.tsx
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

import {ArticleModel} from "./models";
import api from "./api";

interface RouteParams {
    publicationId: string;
    articleId?: string;
}

type Props = RouteComponentProps<RouteParams, {}>;

interface State {
    model: ArticleModel;
}

export default class ArticleEditPage extends React.PureComponent<Props, State> {
    state: State = {
        model: {
            id: "",
            publicationId: "",
            title: "",
            content: "",
        },
    };

    private onTitleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const title = ev.target.value;
        this.setState(({model}) => ({
            model: {...model, title},
        }));
    }

    private onContentChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const content = ev.target.value;
        this.setState(({model}) => ({
            model: {...model, content},
        }));
    }

    private onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();

        const {params} = this.props;
        const {model} = this.state;
        if (model.id) {
            api.articles.edit(params.publicationId, model.id, model);
        } else {
            api.articles.create(params.publicationId, model);
        }

        this.props.router.goBack();
    }

    render(): JSX.Element {
        const {model} = this.state;

        return (
            <form onSubmit={this.onSubmit}>
                <input
                    name="title" type="text" onChange={this.onTitleChange}
                    value={model.title} />
                <textarea
                    name="content" style={{display: "block"}} onChange={this.onContentChange}
                    value={model.content} />
                <input type="submit" />
            </form>
        );
    }
}
