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

import * as React from "react"
import {Link} from "react-router"

import {AuthorModel, ArticleEditModel} from "./state/models"
import AuthorInputView from "./AuthorInputView"
import block from "./style/bem"

import "./ArticleEditView.scss"

export interface StateProps {
    articleId: string
    publicationId: string
    model: ArticleEditModel
    isLoading: boolean
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

type Props = StateProps & DispatchProps

export default function ArticleEditView({articleId, publicationId, model, isLoading,
                                         ...actions}: Props): JSX.Element {
    const b = block("ArticleEditView")

    return (isLoading || !model) ? (
        <div className={b("", "loading")}>Loading...</div>
    ) : (
        <form
            className={b()}
            onSubmit={ev => {
                ev.preventDefault()
                actions.onSubmit()
            }}
        >
            <Link to={`/publications/${publicationId}/articles`}>
                <button>Back</button>
            </Link>

            <button
                onClick={ev => {
                    ev.preventDefault()
                    actions.onDiscard()
                }}
            >
                Discard Draft
            </button>

            <h1>
                {articleId ? "Edit" : "Create"} Article
            </h1>

            <input
                className={b("input", "block title")}
                name="title"
                type="text"
                onChange={actions.onTitleChange}
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
                onChange={actions.onHeaderImageChange}
                placeholder="Header Image URL"
                autoComplete="off"
            />

            <div className={b("authors")}>
                {model.authors.map((model, index) =>
                    <AuthorInputView
                        {...{model, index}}
                        key={index}
                        containerClass={b("author")}
                        nameClass={b("input")}
                        emailClass={b("input")}
                        onChange={actions.onAuthorChange}
                        onRemove={actions.onAuthorRemove}
                    />
                )}
            </div>

            <button
                onClick={ev => {
                    ev.preventDefault()
                    actions.onAuthorAdd()
                }}
            >
                Add Author
            </button>

            <textarea
                className={b("input", "block content")}
                name="content"
                onChange={actions.onContentChange}
                value={model.content}
                required={true}
            />

            <input type="submit" value={(articleId ? "Update" : "Create") + " Article"}/>
        </form >
    )
}
