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
import {stringify as stringifyQuery} from "query-string"

import {Mutable, IdMapModel, actionCreator, Action, PaginatedArray, FetchError,
        API_ROOT, responseToPaginatedArray, toFetchError} from "./util"
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
    type SelectPayload = {publicationId: string}
    export type Select = Action<SelectPayload>
    export const select = actionCreator<SelectPayload>("SELECT_PUBLICATION")

    type StartLoadingPayload = {}
    export const startLoading = actionCreator<StartLoadingPayload>("START_LOADING_PUBLICATIONS")

    type ReceivePayload = {page: PaginatedArray<PublicationModel>}
    export const receive = actionCreator<ReceivePayload>("RECIEVE_PUBLICATIONS")
}

// Reducer

function publicationsByIdReducer(state: IdMapModel<PublicationModel> = {},
                                 action: Action<any>): IdMapModel<PublicationModel> {
    if (publicationsActions.receive.isTypeOf(action)) {
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
    if (publicationsActions.startLoading.isTypeOf(action)) {
        return true
    }

    if (publicationsActions.receive.isTypeOf(action)) {
        return false
    }

    return state
}

export const publicationsReducer = combineReducers<PublicationsStateModel>({
    publicationsById: publicationsByIdReducer,
    isLoadingPublications: isLoadingPublicationsReducer,
})

// Saga Helpers

function responseToPublicationModel(response: any): PublicationModel {
    return response as PublicationModel
}

async function listPublicatons(
    pageToken: string | null
): Promise<PaginatedArray<PublicationModel>> {
    if (pageToken === PaginatedArray.LAST_PAGE_TOKEN) {
        return {
            items: [],
            nextPageToken: PaginatedArray.LAST_PAGE_TOKEN,
        }
    }

    try {
        const params = stringifyQuery({
            pageToken: pageToken || undefined,
            pageSize: 100,  // ask for large page to minimize the number of requests
        })

        const resp = await fetch(`${API_ROOT}/publications?${params}`, {
            method: "GET",
            mode: "cors",
        })

        if (!resp.ok) {
            throw new FetchError("", {resp})
        }

        return responseToPaginatedArray(responseToPublicationModel, await resp.json())
    } catch (err) {
        throw toFetchError(err)
    }
}

// Saga

export function* loadPublicationsSaga(): Iterator<Effect> {
    const selectAction: publicationsActions.Select =
        yield take(publicationsActions.select.type)
    const {publicationId} = selectAction.payload

    try {
        let pageToken: string | null = null
        while (pageToken !== PaginatedArray.LAST_PAGE_TOKEN) {
            yield put(publicationsActions.startLoading({}))
            const page: PaginatedArray<PublicationModel> =
                yield call(listPublicatons, pageToken)
            yield put(publicationsActions.receive({page}))

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

