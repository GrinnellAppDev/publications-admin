/**
 * ArticleEditPage.ts
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

import {RouteComponentProps} from "react-router"
import {connect} from "react-redux"

import {StateModel} from "./state/models"
import {updateArticleDraft, submitArticleDraft, discardArticleDraft} from "./state/actions"

import ArticleEditView, {StateProps, DispatchProps} from "./ArticleEditView"

interface RouteParams {
    publicationId: string
    articleId?: string
}

interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

export default connect<StateProps, DispatchProps, OwnProps>(
    (state: StateModel, {params}) => ({
        publicationId: params.publicationId,
        articleId: params.articleId || "",
        model: state.articleDraftsById[params.articleId || ""],
        isLoading: state.loadingArticles.includes(params.articleId),
        isSubmitting: state.submittingDrafts.includes(params.articleId),
    }),

    (dispatch, {params}) => ({
        onAuthorAdd: () => {
            dispatch(updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({
                    authors: [...draft.authors, {name: "", email: ""}],
                })
            }))
        },

        onAuthorChange: (newAuthorIndex, newAuthor) => {
            dispatch(updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({
                    authors: draft.authors.map((author, index) =>
                        (index === newAuthorIndex) ? newAuthor : author
                    ),
                })
            }))
        },

        onAuthorRemove: (removeIndex) => {
            dispatch(updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({
                    authors: draft.authors.filter((author, index) => index !== removeIndex),
                })
            }))
        },

        onContentChange: (ev) => {
            dispatch(updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({content: ev.target.value})
            }))
        },

        onHeaderImageChange: (ev) => {
            dispatch(updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({headerImage: ev.target.value})
            }))
        },

        onTitleChange: (ev) => {
            dispatch(updateArticleDraft({
                id: params.articleId || "",
                update: (draft) => ({title: ev.target.value})
            }))
        },

        onSubmit: () => {
            const {publicationId, articleId} = params
            dispatch(submitArticleDraft({publicationId, articleId}))
        },

        onDiscard: () => {
            dispatch(discardArticleDraft({id: params.articleId}))
        },
    })
)(
    ArticleEditView
)
