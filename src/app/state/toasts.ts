/**
 * toasts.ts
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

import {delay, Task} from "redux-saga"
import {call, fork, cancel, cancelled, take, put, Effect} from "redux-saga/effects"
import {v4 as uuid} from "uuid"

import {actionCreator, Action} from "./util"

// Models

export interface ToastButtonModel {
    readonly id: string
    readonly text: string
}

export interface ToastModel {
    readonly id: string
    readonly text: string
    readonly buttons: ReadonlyArray<ToastButtonModel>
}

// Actions

export namespace toastsActions {
    type CreatePayload = {item: ToastModel}
    export const create = actionCreator<CreatePayload>("CREATE_TOAST")

    type ClosePayload = {toastId: string, buttonId?: string}
    export type Close = Action<ClosePayload>
    export const close = actionCreator<ClosePayload>("CLOSE_TOAST")
}

// Reducer

export function toastsReducer(state: ReadonlyArray<ToastModel> = [],
                              action: Action<any>): ReadonlyArray<ToastModel> {
    if (toastsActions.close.isTypeOf(action)) {
        const {toastId} = action.payload
        return state.filter((toast) => toast.id !== toastId)
    }

    if (toastsActions.create.isTypeOf(action)) {
        const {item} = action.payload
        return [...state, item]
    }

    return state
}

// Saga

const DEFAULT_TOAST_DURATION = 4000

export function* createToast(item: ToastModel): Iterator<Effect> {
    try {
        yield put(toastsActions.create({item}))

        const closeAction: toastsActions.Close = yield take((action: any) =>
            toastsActions.close.isTypeOf(action) && action.payload.toastId === item.id
        )
        const {buttonId} = closeAction.payload

        return buttonId
    } finally {
        if (yield cancelled()) {
            yield put(toastsActions.close({toastId: item.id}))
        }
    }

}

export function* createTimedToast(item: ToastModel,
                           duration: number = DEFAULT_TOAST_DURATION): Iterator<Effect> {
    const delayTask: Task = yield fork(function* (): Iterator<Effect> {
        yield call(delay, duration)
        yield put(toastsActions.close({toastId: item.id}))
    })

    const buttonId: string = yield call(createToast, item)

    if (buttonId) {
        yield cancel(delayTask)
    }

    return buttonId
}

export function* createInfoToast(text: string, duration?: number): Iterator<Effect> {
    const item: ToastModel = {
        id: uuid(),
        buttons: [
            {
                id: uuid(),
                text: "Close",
            }
        ],
        text,
    }

    return yield call(createTimedToast, item, duration)
}
