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
import {RouteComponentProps, Link} from "react-router";
import * as BEMHelper from "react-bem-helper";

import {ArticleModel} from "./models";
import api from "./api";

import "./ArticleEditPage.scss";

interface RouteParams {
    publicationId: string;
    articleId?: string;
}

type Props = RouteComponentProps<RouteParams, {}>;

enum SubmissionState {
    EDITING,
    SUBMITTING,
    ERRORED
}

interface State {
    model: ArticleModel;
    isLoading: boolean;
    submissionState: SubmissionState;
}

const bem = new BEMHelper("ArticleEditPage");

export default class ArticleEditPage extends React.PureComponent<Props, State> {
    state: State = {
        isLoading: false,
        submissionState: SubmissionState.EDITING,
        model: {
            id: "",
            publication: "",
            title: "",
            content: "",
            authorName: "",
            authorEmail: "",
            headerImage: "",
            dateEdited: new Date(),
            datePublished: new Date(),
        },
    };

    async componentDidMount(): Promise<void> {
        const {params} = this.props;
        this.setState({submissionState: SubmissionState.EDITING});

        if (params.articleId) {
            this.setState({isLoading: true});
            this.setState({
                model: await api.articles.get(params.publicationId, params.articleId),
                isLoading: false,
            });
        }
    }

    private onTitleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        const title = ev.target.value;
        this.setState(({model}) => ({
            model: {...model, title},
        }));
    }

    private onContentChange = (ev: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const content = ev.target.value;
        this.setState(({model}) => ({
            model: {...model, content},
        }));
    }

    private onSubmit = async (ev: React.FormEvent<HTMLFormElement>): Promise<void> => {
        ev.preventDefault();

        this.setState({submissionState: SubmissionState.SUBMITTING});

        const {params, router} = this.props;
        const {model} = this.state;

        try {
            if (model.id) {
                await api.articles.edit(params.publicationId, model.id, model);
            } else {
                await api.articles.create(params.publicationId, model);
            }

            router.goBack();
        } catch (err) {
            this.setState({submissionState: SubmissionState.ERRORED});
        }
    }

    render(): JSX.Element {
        const {params} = this.props;
        const {model, isLoading, submissionState} = this.state;

        return (isLoading) ? (
            <div {...bem(null, ["loading"])}>Loading...</div>
        ) : (
            <form {...bem()} onSubmit={this.onSubmit}>
                <Link to={`/publications/${params.publicationId}/articles`}>
                    <button>Back</button>
                </Link>

                <h1>
                    {model.id ? "Edit" : "Create"} Article
                </h1>

                {(submissionState === SubmissionState.ERRORED) ? (
                    <div>There was a problem submitting your article.</div>
                ) : (submissionState === SubmissionState.SUBMITTING) ? (
                    <div>Submitting...</div>
                ) : (
                    ""
                )}

                <input
                    name="title" type="text" onChange={this.onTitleChange} value={model.title}
                    placeholder="Title" autoComplete="off"
                    {...bem("title-input")} />

                <input
                    name="headerImage" type="url" value={model.headerImage}
                    placeholder="Header Image URL" autoComplete="off"
                    {...bem("header-image-input")} />

                <div {...bem("author-wrapper")}>
                    <input
                        name="authorName" type="text" value={model.authorName}
                        placeholder="Author Name" autoComplete="off" autoCapitalize="word" />
                    <input
                        name="authorEmail" type="email" value={model.authorEmail}
                        placeholder="Author Email" autoComplete="off" />
                </div>

                <textarea
                    name="content" onChange={this.onContentChange} value={model.content}
                    {...bem("content-input")} />

                <input type="submit" />
            </form>
        );
    }
}
