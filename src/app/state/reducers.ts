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

import {IdMapModel, PublicationModel, ArticleBriefModel} from "./models"
import {SyncAction, recievePublications, recieveArticles, clearArticles} from "./actions"

export function publicationsById(state: IdMapModel<PublicationModel> = {},
                                 action: SyncAction<any>): IdMapModel<PublicationModel> {
    if (recievePublications.isTypeOf(action)) {
        const {items} = action.payload
        const newState = {...state} as {[id: string]: PublicationModel}
        items.forEach(publication => {
            newState[publication.id] = publication
        })

        return newState
    }

    return state
}

export function articlesById(state: IdMapModel<ArticleBriefModel> = {},
                             action: SyncAction<any>): IdMapModel<ArticleBriefModel> {
    if (recieveArticles.isTypeOf(action)) {
        const {items} = action.payload
        const newState = {...state} as {[id: string]: ArticleBriefModel}
        items.forEach(article => {
            newState[article.id] = (article.id in state) ? (
                {...state[article.id], ...article}
            ) : (
                article
            )
        })

        return newState
    }

    if (clearArticles.isTypeOf(action)) {
        return {}
    }

    return state
}

export function isLoadingArticles(state: boolean = false, action: SyncAction<any>): boolean {
    if (recieveArticles.isTypeOf(action)) {
        return false
    }

    if (clearArticles.isTypeOf(action)) {
        return true
    }

    return state
}
