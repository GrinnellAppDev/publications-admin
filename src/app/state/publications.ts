/**
 * publications.ts
 *
 * Created by Zander Otavka on 5/15/17.
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

import {combineReducers} from "redux"
import {call, spawn, take, select, put, Effect} from "redux-saga/effects"
import {hashHistory} from "react-router"
import {v4 as uuid} from "uuid"

import {Mutable, IdMapModel, actionCreator, Action} from "./util"
import api, {PaginatedArray, FetchError} from "./api"
import {getDefaultPublicationId} from "./selectors"
import {createToast} from "./toasts"

// Model

export interface PublicationModel {
    readonly id: string
    readonly name: string
}

export interface PublicationsStateModel {
    readonly publicationsById: IdMapModel<PublicationModel>
    readonly isLoadingPublications: boolean
}

// Actions

export namespace publicationsActions {
    type SelectPublicationPayload = {publicationId: string}
    export type SelectPublication = Action<SelectPublicationPayload>
    export const selectPublication = actionCreator<SelectPublicationPayload>("SELECT_PUBLICATION")

    type StartLoadingPublicationsPayload = {}
    export const startLoadingPublications =
        actionCreator<StartLoadingPublicationsPayload>("START_LOADING_PUBLICATIONS")

    type ReceivePublicationsPayload = {page: PaginatedArray<PublicationModel>}
    export const receivePublications =
        actionCreator<ReceivePublicationsPayload>("RECIEVE_PUBLICATIONS")
}

// Reducer

function publicationsByIdReducer(state: IdMapModel<PublicationModel> = {},
                                 action: Action<any>): IdMapModel<PublicationModel> {
    if (publicationsActions.receivePublications.isTypeOf(action)) {
        const {page} = action.payload
        const newState = {...state} as Mutable<IdMapModel<PublicationModel>>
        page.items.forEach((publication) => {
            newState[publication.id] = publication
        })

        return newState
    }

    return state
}

function isLoadingPublicationsReducer(state: boolean = false, action: Action<any>): boolean {
    if (publicationsActions.startLoadingPublications.isTypeOf(action)) {
        return true
    }

    if (publicationsActions.receivePublications.isTypeOf(action)) {
        return false
    }

    return state
}

export const publicationsReducer = combineReducers<PublicationsStateModel>({
    publicationsById: publicationsByIdReducer,
    isLoadingPublications: isLoadingPublicationsReducer,
})

// Saga

export function* loadPublicationsSaga(): Iterator<Effect> {
    const selectAction: publicationsActions.SelectPublication =
        yield take(publicationsActions.selectPublication.type)
    const {publicationId} = selectAction.payload

    try {
        let pageToken: string | null = null
        while (pageToken !== PaginatedArray.LAST_PAGE_TOKEN) {
            yield put(publicationsActions.startLoadingPublications({}))
            const page: PaginatedArray<PublicationModel> =
                yield call(api.publications.list, pageToken)
            yield put(publicationsActions.receivePublications({page}))

            pageToken = page.nextPageToken
        }
    } catch (err) {
        if (FetchError.isTypeOf(err)) {
            yield spawn(createToast, {
                id: uuid(),
                text: "Could not load publications.  Check you internet connection and refresh " +
                      "the page.",
                buttons: [],
            })
        }

        throw err
    }

    if (!publicationId) {
        const defaultPublicationId: string = yield select(getDefaultPublicationId)
        hashHistory.replace(`/${defaultPublicationId}`)
    }
}

