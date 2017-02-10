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

import {ArticleModel} from "./models";
import api from "./api";
import {pageRootStyle} from "./sharedStyles";

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
            <div style={pageRootStyle}>Loading...</div>
        ) : (
            <form onSubmit={this.onSubmit} style={pageRootStyle}>
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
                    style={{width: "100%", fontSize: "1.3rem", fontWeight: "bold"}}
                    placeholder="Title" autoComplete="off" />
                <textarea
                    name="content" onChange={this.onContentChange} value={model.content}
                    style={{
                        display: "block",
                        width: "100%",
                        height: "50vh",
                        fontSize: "0.9rem",
                    }} />
                <input type="submit" />
            </form>
        );
    }
}
