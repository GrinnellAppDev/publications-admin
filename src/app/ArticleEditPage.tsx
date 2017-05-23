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

import React from "react"
import {Link, RouteComponentProps} from "react-router"
import {connect} from "react-redux"

import {StateModel} from "./state/store"
import {draftsActions} from "./state/drafts"
import {AuthorModel, ArticleEditModel} from "./state/articles"

import block from "./style/bem"
import "./ArticleEditPage.scss"

interface AuthorInputProps {
    index: number
    model: AuthorModel
    onChange: (index: number, newModel: AuthorModel) => void
    onRemove: (index: number) => void
}

interface StateProps {
    articleId: string
    publicationId: string
    model: ArticleEditModel
    isLoading: boolean
    isSubmitting: boolean
}

interface DispatchProps {
    onSubmit: (ev: React.FormEvent<HTMLFormElement>) => void
    onDiscard: (ev: React.MouseEvent<HTMLButtonElement>) => void
    onTitleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onHeaderImageChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onAuthorChange: (index: number, newModel: AuthorModel) => void
    onAuthorRemove: (index: number) => void
    onAuthorAdd: (ev: React.MouseEvent<HTMLButtonElement>) => void
    onContentChange: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void
}

interface RouteParams {
    publicationId: string
    articleId?: string
}

interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

const b = block("ArticleEditPage")

function AuthorInput({model, index, onChange, ...props}: AuthorInputProps) {
    return (
        <div className={b("author")}>
            <input
                className={b("input")}
                name="authorName"
                type="text"
                value={model.name}
                onChange={(ev) => onChange(index, {...model, name: ev.target.value})}
                placeholder="Author Name"
                autoComplete="off"
                autoCapitalize="word"
            />

            <input
                className={b("input")}
                name="authorEmail"
                type="email"
                value={model.email}
                onChange={(ev) => onChange(index, {...model, email: ev.target.value})}
                placeholder="Author Email"
                autoComplete="off"
            />

            <button
                onClick={(ev) => {
                    ev.preventDefault()
                    props.onRemove(index)
                }}
            >
                Remove
            </button>
        </div>
    )
}

export default connect<StateProps, DispatchProps, OwnProps>(
    ({drafts, articles}: StateModel, {params}: OwnProps) => ({
        publicationId: params.publicationId,
        articleId: params.articleId || "",
        model: drafts.articleDraftsById[params.articleId || ""],
        isLoading: articles.loadingArticles.includes(params.articleId),
        isSubmitting: drafts.submittingDrafts.includes(params.articleId),
    }),

    (dispatch, {params}) => ({
        onAuthorAdd: (ev) => {
            ev.preventDefault()
            dispatch(draftsActions.updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({
                    authors: [...draft.authors, {name: "", email: ""}],
                })
            }))
        },

        onAuthorChange: (newAuthorIndex, newAuthor) => {
            dispatch(draftsActions.updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({
                    authors: draft.authors.map((author, index) =>
                        (index === newAuthorIndex) ? newAuthor : author
                    ),
                })
            }))
        },

        onAuthorRemove: (removeIndex) => {
            dispatch(draftsActions.updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({
                    authors: draft.authors.filter((author, index) => index !== removeIndex),
                })
            }))
        },

        onContentChange: (ev) => {
            dispatch(draftsActions.updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({content: ev.target.value})
            }))
        },

        onHeaderImageChange: (ev) => {
            dispatch(draftsActions.updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({headerImage: ev.target.value})
            }))
        },

        onTitleChange: (ev) => {
            dispatch(draftsActions.updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({title: ev.target.value})
            }))
        },

        onSubmit: (ev) => {
            const {publicationId, articleId} = params
            ev.preventDefault()
            dispatch(draftsActions.submitArticleDraft({publicationId, articleId}))
        },

        onDiscard: (ev) => {
            ev.preventDefault()
            dispatch(draftsActions.discardArticleDraft({id: params.articleId}))
        },
    }),
)
(function ArticleEditPage({articleId, model, isSubmitting, ...props}) {
    return (props.isLoading || !model) ? (
        <div className={b("", "loading")}>Loading...</div>
    ) : (
        <form className={b()} onSubmit={props.onSubmit}>
            <Link to={`/${props.publicationId}`}>
                <button>Back</button>
            </Link>

            <button onClick={props.onDiscard}>
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
                    <AuthorInput
                        key={i}
                        index={i}
                        model={model}
                        onChange={props.onAuthorChange}
                        onRemove={props.onAuthorRemove}
                    />
                )}
            </div>

            <button onClick={props.onAuthorAdd}>
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
})
