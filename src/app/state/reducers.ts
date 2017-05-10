/**
 * reducers.ts
 *
 * Created by Zander Otavka on 2/19/16.
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

import {v4 as uuid} from "uuid"

import {AuthenticationModel, IdMapModel, PublicationModel, ShortArticleModel, ArticleCreateModel,
        ToastActionTypeModel, ToastModel} from "./models"
import * as actions from "./actions"

type Action = actions.SyncAction<any>

type Mutable<T> = {
    [P in keyof T]: T[P]
}

const emptyAuthModel = {username: "", token: ""}

export function auth(state: AuthenticationModel = emptyAuthModel,
                     action: Action): AuthenticationModel {
    if (actions.saveAuthInfo.isTypeOf(action)) {
        return action.payload
    }

    if (actions.receiveAuthError.isTypeOf(action)) {
        return emptyAuthModel
    }

    return state
}

export function publicationsById(state: IdMapModel<PublicationModel> = {},
                                 action: Action): IdMapModel<PublicationModel> {
    if (actions.receivePublications.isTypeOf(action)) {
        const {page} = action.payload
        const newState = {...state} as Mutable<IdMapModel<PublicationModel>>
        page.items.forEach((publication) => {
            newState[publication.id] = publication
        })

        return newState
    }

    return state
}

export function articlesById(state: IdMapModel<ShortArticleModel> = {},
                             action: Action): IdMapModel<ShortArticleModel> {
    if (actions.receiveArticles.isTypeOf(action)) {
        const {page} = action.payload
        const newState = {...state} as Mutable<IdMapModel<ShortArticleModel>>
        page.items.forEach((article) => {
            newState[article.id] = (article.id in state) ? (
                {...state[article.id], ...article}
            ) : (
                article
            )
        })

        return newState
    }

    if (actions.deleteLocalArticle.isTypeOf(action)) {
        const {item} = action.payload
        const {[item.id]: _, ...newState} = state
        return newState
    }

    if (actions.recieveFullArticle.isTypeOf(action) ||
        actions.undeleteArticle.isTypeOf(action) ||
        actions.receiveArticleSubmitSuccess.isTypeOf(action)) {

        const {item} = action.payload
        return {...state, [item.id]: item}
    }

    if (actions.clearArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        const newState = {} as Mutable<IdMapModel<ShortArticleModel>>
        Object.keys(state).forEach((articleId) => {
            if (state[articleId].publication !== publicationId) {
                newState[articleId] = state[articleId]
            }
        })

        return newState
    }

    return state
}

const emptyDraft: ArticleCreateModel = {
    title: "",
    content: "",
    authors: [{name: "", email: ""}],
    headerImage: "",
}

export function articleDraftsById(state: IdMapModel<ArticleCreateModel> = {},
                                  action: Action): IdMapModel<ArticleCreateModel> {
    if (actions.createArticleDraft.isTypeOf(action)) {
        const {id, item} = action.payload
        if (item) {
            const {title, authors, content, headerImage} = item
            const newDraft = {...emptyDraft, title, authors, content, headerImage}
            return {...state, [id]: newDraft}
        } else {
            return {...state, [id]: emptyDraft}
        }
    }

    if (actions.updateArticleDraft.isTypeOf(action)) {
        const {id, update} = action.payload
        return {...state, [id || ""]: {...state[id || ""], ...update(state[id || ""])}}
    }

    if (actions.discardArticleDraft.isTypeOf(action)) {
        const {id} = action.payload
        const {[id || ""]: _, ...newState} = state
        return newState
    }

    if (actions.receiveArticleSubmitSuccess.isTypeOf(action)) {
        const {item, isNew} = action.payload
        const {[isNew ? "" : item.id]: _, ...newState} = state
        return newState
    }

    return state
}

export function articlesPageTokensByParentId(state: IdMapModel<string> = {},
                                             action: Action): IdMapModel<string> {
    if (actions.receiveArticles.isTypeOf(action)) {
        const {publicationId, page} = action.payload
        return {
            ...state,
            [publicationId]: page.nextPageToken,
        }
    }

    if (actions.clearArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        const {[publicationId]: _, ...newState} = state
        return newState
    }

    return state
}

export function isLoadingPublications(state: boolean = false, action: Action): boolean {
    if (actions.startLoadingPublications.isTypeOf(action)) {
        return true
    }

    if (actions.receivePublications.isTypeOf(action)) {
        return false
    }

    return state
}

export function loadingPublications(state: ReadonlyArray<string> = [],
                                    action: Action): ReadonlyArray<string> {
    if (actions.loadNextArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        return [...state, publicationId]
    }

    if (actions.receiveArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        return state.filter((id) => id !== publicationId)
    }

    return state
}

export function loadingArticles(state: ReadonlyArray<string> = [],
                                action: Action): ReadonlyArray<string> {
    if (actions.loadFullArticle.isTypeOf(action)) {
        const {articleId} = action.payload
        return [...state, articleId]
    }

    if (actions.recieveFullArticle.isTypeOf(action)) {
        const {item} = action.payload
        return state.filter((id) => id !== item.id)
    }

    return state
}

function createInfoToast(text: string, duration: number = 4000): ToastModel {
    return {
        id: uuid(),
        timeCreated: new Date(),
        expireAction: null,
        cancelAction: null,
        buttons: [],
        duration,
        text,
    }
}

export function toasts(state: ReadonlyArray<ToastModel> = [],
                       action: Action): ReadonlyArray<ToastModel> {
    if (actions.closeToast.isTypeOf(action)) {
        const {id} = action.payload
        return state.filter((toast) => toast.id !== id)
    }

    if (actions.createInfoToast.isTypeOf(action)) {
        const {text, duration} = action.payload
        return [...state, createInfoToast(text, duration)]
    }

    if (actions.deleteLocalArticle.isTypeOf(action)) {
        const {item} = action.payload
        // console.assert(item.title !== undefined)  // todo: uncomment when server validates
        const title = ((item.title || "").length > 20) ? (
            item.title.substring(0, 15) + "..." + item.title.substring(item.title.length - 5)
        ) : (
            item.title || "Untitled"
        )

        return [...state, {
            id: uuid(),
            timeCreated: new Date(),
            duration: 4000,
            text: `Deleting "${title}"`,
            expireAction: {
                type: ToastActionTypeModel.DELETE_REMOTE_ARTICLE,
                args: [item],
            },
            cancelAction: {
                type: ToastActionTypeModel.DELETE_REMOTE_ARTICLE,
                args: [item],
            },
            buttons: [{
                text: "Undo",
                action: {
                    type: ToastActionTypeModel.UNDELETE_ARTICLE,
                    args: [{item}],
                },
            }],
        }]
    }

    if (actions.recieveArticleDeleteError.isTypeOf(action)) {
        return [...state, createInfoToast("There was a problem deleting the article.")]
    }

    if (actions.startSubmittingArticleDraft.isTypeOf(action)) {
        return [...state, createInfoToast("Submitting...", 1000)]
    }

    if (actions.receiveArticleSubmitError.isTypeOf(action)) {
        return [...state, createInfoToast("There was a problem submitting your article.")]
    }

    return state
}
