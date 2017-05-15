/**
 * ArticleEditView.tsx
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

import React from "react"
import {Link, RouteComponentProps} from "react-router"

import {AuthorModel, ArticleEditModel} from "./state/articles"
import AuthorInputView from "./AuthorInputView"
import block from "./style/bem"

import "./ArticleEditView.scss"

export interface StateProps {
    articleId: string
    publicationId: string
    model: ArticleEditModel
    isLoading: boolean
    isSubmitting: boolean
}

export interface DispatchProps {
    onSubmit: () => void
    onDiscard: () => void
    onTitleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onHeaderImageChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onAuthorChange: (index: number, newModel: AuthorModel) => void
    onAuthorRemove: (index: number) => void
    onAuthorAdd: () => void
    onContentChange: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void
}

interface RouteParams {
    publicationId: string
    articleId?: string
}

export interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

type Props = StateProps & DispatchProps & OwnProps

export default function ArticleEditView({articleId, model, isSubmitting,
                                         ...props}: Props): JSX.Element {
    const b = block("ArticleEditView")

    return (props.isLoading || !model) ? (
        <div className={b("", "loading")}>Loading...</div>
    ) : (
        <form
            className={b()}
            onSubmit={(ev) => {
                ev.preventDefault()
                props.onSubmit()
            }}
        >
            <Link to={`/${props.publicationId}`}>
                <button>Back</button>
            </Link>

            <button
                onClick={(ev) => {
                    ev.preventDefault()
                    props.onDiscard()
                }}
            >
                Discard Draft
            </button>

            <span> Draft <b>not</b> saved.  Will be discarded on page refresh.</span>

            <h1>
                {articleId ? "Edit" : "Create"} Article
            </h1>

            <input
                className={b("input", "block title")}
                name="title"
                type="text"
                onChange={props.onTitleChange}
                value={model.title}
                placeholder="Title"
                autoComplete="off"
                required={true}
            />

            <input
                className={b("input", "block")}
                name="headerImage"
                type="url"
                value={model.headerImage}
                onChange={props.onHeaderImageChange}
                placeholder="Header Image URL"
                autoComplete="off"
            />

            <div className={b("authors")}>
                {model.authors.map((model, i) =>
                    <AuthorInputView
                        model={model}
                        index={i}
                        key={i}
                        containerClass={b("author")}
                        nameClass={b("input")}
                        emailClass={b("input")}
                        onChange={props.onAuthorChange}
                        onRemove={props.onAuthorRemove}
                    />
                )}
            </div>

            <button
                onClick={(ev) => {
                    ev.preventDefault()
                    props.onAuthorAdd()
                }}
            >
                Add Author
            </button>

            <textarea
                className={b("input", "block content")}
                name="content"
                onChange={props.onContentChange}
                value={model.content}
                required={true}
            />

            <input
                type="submit"
                value={(articleId ? "Update" : "Create") + " Article"}
                hidden={isSubmitting}
            />

            <div hidden={!isSubmitting}>{(articleId ? "Updating" : "Creating")} Article...</div>
        </form>
    )
}
