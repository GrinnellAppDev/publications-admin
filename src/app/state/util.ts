/**
 * util.ts
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

import {Action as BaseAction} from "redux"

// General

export function isExpired(date: number): boolean {
    return date < Date.now()
}

// Models

export type Mutable<T> = {
    [P in keyof T]: T[P]
}

export interface IdMapModel<T> {
    readonly [id: string]: T
}

// Actions

export interface Action<T> extends BaseAction {
    readonly type: string
    readonly payload: T
}

export interface ActionCreator<T> {
    (payload: T): Action<T>
    isTypeOf(action: Action<any>): action is Action<T>
    type: string
}

export function actionCreator<T>(type: string): ActionCreator<T> {
    return Object.assign(
        (payload: T): Action<T> => ({type, payload}),
        {
            isTypeOf: (action: any): action is Action<T> => action.type === type,
            type,
        },
    )
}

// Exceptions

export interface CustomError<T> extends Error {
    type: string
    payload: T
}

interface MessageFunction<T> {
    (message: string, payload: T): string
}

interface CustomErrorClass<T> {
    new (message?: string, payload?: T): CustomError<T>
    isTypeOf(err: any): err is CustomError<T>
}

export function createErrorClass<T>(type: string, messageFunction: MessageFunction<T> =
                                            (message) => message): CustomErrorClass<T> {
    return class extends Error {
        static isTypeOf(err: CustomError<any>): err is CustomError<T> {
            return err.type === type
        }

        type: string = type

        constructor(message: string = "", public payload: T = null) {
            super(messageFunction(message, payload))
        }
    }
}

// Api

export const API_ROOT = process.env.API_ROOT

export interface PaginatedArray<T> {
    readonly nextPageToken?: string
    readonly items: ReadonlyArray<T>
}

export namespace PaginatedArray {
    export const LAST_PAGE_TOKEN = ""
}

export interface FetchErrorPayload {
    resp?: Response
}

export type FetchError = CustomError<FetchErrorPayload>
export const FetchError = createErrorClass<FetchErrorPayload>(
    "FETCH_ERROR",
    (message, {resp}) => (resp) ? (
        `Fetch errored with code: ${resp.status} - ${resp.statusText}. ${message}`
    ) : (
        `Fetch errored. ${message}`
    )
)

export function toFetchError(err: any): FetchError {
    if (FetchError.isTypeOf(err)) {
        return err
    } else if (err instanceof TypeError) {
        return new FetchError(err.message, {})
    } else {
        return new FetchError("", {})
    }
}

export function responseToArray<T>(elementConversion: (element: any) => T, request: any): T[] {
    return (request as any[]).map(elementConversion)
}

export function responseToPaginatedArray<T>(elementConversion: (element: any) => T,
                                     response: any): PaginatedArray<T> {
    return {
        items: responseToArray(elementConversion, response.items),
        nextPageToken: response.nextPageToken || PaginatedArray.LAST_PAGE_TOKEN,
    }
}

export function arrayToRequest<T>(elementConversion: (element: T) => any, array: T[]): any {
    return array.map(elementConversion).filter((element) => element !== undefined)
}
