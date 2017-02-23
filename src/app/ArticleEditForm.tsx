/**
 * ArticleEditForm.tsx
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
import {block} from "react-bem-helper"
import {Link} from "react-router"

import {AuthorModel, FullArticleModel, SubmissionStateModel} from "./state/models"
import AuthorInput from "./AuthorInput"

import "./ArticleEditForm.scss"

export interface StateProps {
    model: FullArticleModel
    isLoading: boolean
    submissionState: SubmissionStateModel
    publicationId: string
}

export interface DispatchProps {
    onSubmit: (ev: React.FormEvent<HTMLFormElement>) => void
    onTitleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onHeaderImageChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onAuthorChange: (index: number, newModel: AuthorModel) => void
    onAuthorRemove: (index: number) => void
    onAuthorAdd: (ev: React.MouseEvent<HTMLButtonElement>) => void
    onBriefChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onContentChange: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void
}

type Props = StateProps & DispatchProps

const b = block("ArticleEditForm")

export default function ArticleEditForm({isLoading, submissionState, model, publicationId,
                                         ...actions}: Props): JSX.Element {
    return (isLoading) ? (
        <div className={b("", "loading")}>Loading...</div>
    ) : (
        <form className={b()} onSubmit={actions.onSubmit}>
            <Link to={`/publications/${publicationId}/articles`}>
                <button>Back</button>
            </Link>

            <h1>
                {model.id ? "Edit" : "Create"} Article
            </h1>

            <input
                className={b("input", "block title")}
                name="title"
                type="text"
                onChange={actions.onTitleChange}
                value={model.title}
                placeholder="Title"
                autoComplete="off"
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
                    <AuthorInput
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

            <button onClick={actions.onAuthorAdd}>Add Author</button>

            <input
                className={b("input", "block")}
                name="brief"
                type="text"
                value={model.brief}
                onChange={actions.onBriefChange}
                placeholder="Brief"
                autoComplete="off"
                maxLength={140}
            />

            <textarea
                className={b("input", "block content")}
                name="content"
                onChange={actions.onContentChange}
                value={model.content}
            />

            <input type="submit" value={(model.id ? "Update" : "Create") + " Article"}/>

            <div
                className={b("submit-status", {
                    "error": true,
                    "hidden": submissionState !== SubmissionStateModel.ERRORED
                })}
            >
                There was a problem submitting your article.
            </div>
            <div
                className={b("submit-status", {
                    "hidden": submissionState !== SubmissionStateModel.SUBMITTING
                })}
            >
                Submitting...
            </div>
        </form>
    )
}
