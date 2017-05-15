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

import {connect} from "react-redux"

import {StateModel} from "./state/store"
import {draftsActions} from "./state/drafts"

import ArticleEditView, {StateProps, DispatchProps, OwnProps} from "./ArticleEditView"

export default connect<StateProps, DispatchProps, OwnProps>(
    ({drafts, articles}: StateModel, {params}) => ({
        publicationId: params.publicationId,
        articleId: params.articleId || "",
        model: drafts.articleDraftsById[params.articleId || ""],
        isLoading: articles.loadingArticles.includes(params.articleId),
        isSubmitting: drafts.submittingDrafts.includes(params.articleId),
    }),

    (dispatch, {params}) => ({
        onAuthorAdd: () => {
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

        onSubmit: () => {
            const {publicationId, articleId} = params
            dispatch(draftsActions.submitArticleDraft({publicationId, articleId}))
        },

        onDiscard: () => {
            dispatch(draftsActions.discardArticleDraft({id: params.articleId}))
        },
    })
)(
    ArticleEditView
)
