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

import {IdMapModel, PublicationModel, ArticleBriefModel, ArticleEditModel,
        SubmissionStateModel} from "./models"
import * as actions from "./actions"

type Action = actions.SyncAction<any>

type Mutable<T> = {
    [P in keyof T]: T[P]
}

export function publicationsById(state: IdMapModel<PublicationModel> = {},
                                 action: Action): IdMapModel<PublicationModel> {
    if (actions.receivePublications.isTypeOf(action)) {
        const {items} = action.payload
        const newState = {...state} as Mutable<IdMapModel<PublicationModel>>
        items.forEach(publication => {
            newState[publication.id] = publication
        })

        return newState
    }

    return state
}

export function articlesById(state: IdMapModel<ArticleBriefModel> = {},
                             action: Action): IdMapModel<ArticleBriefModel> {
    if (actions.receiveArticles.isTypeOf(action)) {
        const {items} = action.payload
        const newState = {...state} as Mutable<IdMapModel<ArticleBriefModel>>
        items.forEach(article => {
            newState[article.id] = (article.id in state) ? (
                {...state[article.id], ...article}
            ) : (
                article
            )
        })

        return newState
    }

    if (actions.deleteLocalArticle.isTypeOf(action)) {
        const {id} = action.payload
        const {[id]: _, ...newState} = state
        return newState
    }

    if (actions.recieveFullArticle.isTypeOf(action) ||
        actions.undeleteLocalArticle.isTypeOf(action) ||
        actions.receiveArticleSubmitSuccess.isTypeOf(action)) {

        const {item} = action.payload
        return {...state, [item.id]: item}
    }

    if (actions.clearArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        const {[publicationId]: _, ...newState} = state
        return newState
    }

    return state
}

const emptyArticleEdit: ArticleEditModel = {
    title: "",
    content: "",
    brief: "",
    authors: [{name: "", email: ""}],
    headerImage: "",
}

export function articleDraftsById(state: IdMapModel<ArticleEditModel> = {},
                                  action: Action): IdMapModel<ArticleEditModel> {
    if (actions.createArticleDraft.isTypeOf(action)) {
        const {id, item} = action.payload
        if (item) {
            const {title, brief, authors, content, headerImage} = item
            return {...state, [id]: {title, brief, authors, content, headerImage}}
        } else {
            return {...state, [id]: emptyArticleEdit}
        }
    }

    if (actions.updateArticleDraft.isTypeOf(action)) {
        const {id, update} = action.payload
        return {...state, [id || ""]: {...state[id || ""], ...update(state[id || ""])}}
    }

    if (actions.receiveArticleSubmitSuccess.isTypeOf(action)) {
        const {item, isNew} = action.payload
        const {[isNew ? "" : item.id]: _, ...newState} = state
        return newState
    }

    return state
}

export function didInitialLoad(state: boolean = false, action: Action): boolean {
    if (actions.startInitialLoad.isTypeOf(action)) {
        return true
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
    if (actions.startLoadingArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        return [...state, publicationId]
    }

    if (actions.receiveArticles.isTypeOf(action)) {
        const {publicationId} = action.payload
        return state.filter(id => id !== publicationId)
    }

    return state
}

export function loadingArticles(state: ReadonlyArray<string> = [],
                                action: Action): ReadonlyArray<string> {
    if (actions.startLoadingFullArticle.isTypeOf(action)) {
        const {id} = action.payload
        return [...state, id]
    }

    if (actions.recieveFullArticle.isTypeOf(action)) {
        const {item} = action.payload
        return state.filter(id => id !== item.id)
    }

    return state
}

export function articleDraftSubmissionState(state: SubmissionStateModel =
                                                SubmissionStateModel.EDITING,
                                            action: Action): SubmissionStateModel {
    if (actions.startSubmittingArticleDraft.isTypeOf(action)) {
        return SubmissionStateModel.SUBMITTING
    }

    if (actions.receiveArticleSubmitSuccess.isTypeOf(action) ||
        actions.createArticleDraft.isTypeOf(action)) {

        return SubmissionStateModel.EDITING
    }

    if (actions.receiveArticleSubmitError.isTypeOf(action)) {
        return SubmissionStateModel.ERRORED
    }

    return state
}
