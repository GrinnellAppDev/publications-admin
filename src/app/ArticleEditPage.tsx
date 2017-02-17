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

import {ArticleModel, AuthorModel} from "./models";
import api from "./api";

import "./ArticleEditPage.scss";

interface AuthorProps {
    index: number;
    model: AuthorModel;
    onChange: (index: number, newModel: AuthorModel) => void;
    onRemove: (index: number) => void;
}

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

class Author extends React.PureComponent<AuthorProps, {}> {
    private emitInputChange(field: "name" | "email", value: string): void {
        const {index, model, onChange} = this.props;
        onChange(index, {...model, [field]: value});
    }

    private onNameChange = ({target}: React.ChangeEvent<HTMLInputElement>): void => {
        this.emitInputChange("name", target.value);
    }

    private onEmailChange = ({target}: React.ChangeEvent<HTMLInputElement>): void => {
        this.emitInputChange("email", target.value);
    }

    private onRemoveClick = (ev: React.MouseEvent<HTMLButtonElement>): void => {
        const {onRemove, index} = this.props;
        ev.preventDefault();
        onRemove(index);
    }

    render(): JSX.Element {
        const {model} = this.props;
        return (
            <div {...bem("author")}>
                <input
                    name="authorName" type="text" value={model.name} onChange={this.onNameChange}
                    placeholder="Author Name" autoComplete="off" autoCapitalize="word" />
                <input
                    name="authorEmail" type="email" value={model.email}
                    onChange={this.onEmailChange} placeholder="Author Email" autoComplete="off" />
                <button onClick={this.onRemoveClick}>Remove</button>
            </div>
        );
    }
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
            brief: "",
            authors: [{name: "", email: ""}],
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

    private onHeaderImageChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        const headerImage = ev.target.value;
        this.setState(({model}) => ({
            model: {...model, headerImage},
        }));
    }

    private onAuthorAdd = (ev: React.MouseEvent<HTMLButtonElement>): void => {
        ev.preventDefault();
        this.setState(({model}) => ({
            model: {
                ...model,
                authors: [...model.authors, {name: "", email: ""}],
            },
        }));
    }

    private onAuthorChange = (newAuthorIndex: number, newAuthor: AuthorModel): void => {
        this.setState(({model}) => ({
            model: {
                ...model,
                authors: model.authors.map((author, index) =>
                    (index === newAuthorIndex) ? newAuthor : author
                ),
            },
        }));
    }

    private onAuthorRemove = (removeIndex: number): void => {
        this.setState(({model}) => ({
            model: {
                ...model,
                authors: model.authors.filter((author, index) => index !== removeIndex),
            },
        }));
    }

    private onBriefChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        const brief = ev.target.value;
        this.setState(({model}) => ({
            model: {...model, brief},
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
        const model = {
            ...this.state.model,
            authors: this.state.model.authors.filter(author => author.name || author.email),
        };

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
        const isErrored = submissionState === SubmissionState.ERRORED;
        const isSubmitting = submissionState === SubmissionState.SUBMITTING;

        return (isLoading) ? (
            <div {...bem("", "loading")}>Loading...</div>
        ) : (
            <form {...bem("")} onSubmit={this.onSubmit}>
                <Link to={`/publications/${params.publicationId}/articles`}>
                    <button>Back</button>
                </Link>

                <h1>
                    {model.id ? "Edit" : "Create"} Article
                </h1>

                <input
                    name="title" type="text" onChange={this.onTitleChange} value={model.title}
                    placeholder="Title" autoComplete="off"
                    {...bem("input", "block title")} />

                <input
                    name="headerImage" type="url" value={model.headerImage}
                    onChange={this.onHeaderImageChange} placeholder="Header Image URL"
                    autoComplete="off" {...bem("input", "block")} />

                <div {...bem("authors")}>
                    {model.authors.map((model, index) =>
                        <Author
                            {...{model, index}} key={index} onChange={this.onAuthorChange}
                            onRemove={this.onAuthorRemove} {...bem("input")} />
                    )}
                </div>

                <button onClick={this.onAuthorAdd}>Add Author</button>

                <input
                    name="brief" type="text" value={model.brief} onChange={this.onBriefChange}
                    placeholder="Brief" autoComplete="off" maxLength={140}
                    {...bem("input", "block")} />

                <textarea
                    name="content" onChange={this.onContentChange} value={model.content}
                    {...bem("input", "block content")} />

                <input type="submit" value={(model.id ? "Update" : "Create") + " Article"} />

                <div {...bem("submit-status", {"hidden": !isErrored, "error": true})}>
                    There was a problem submitting your article.
                </div>
                <div {...bem("submit-status", {"hidden": !isSubmitting})}>
                    Submitting...
                </div>
            </form>
        );
    }
}
