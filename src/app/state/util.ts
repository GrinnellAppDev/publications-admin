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
