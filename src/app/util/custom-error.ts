/**
 * custom-error.ts
 *
 * Created by Zander Otavka on 2/21/17.
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

export interface CustomError<T> extends Error {
    type: string
    payload: T
}

interface MessageFunction<T> {
    (message: string, payload: T): string
}

interface CustomErrorClass<T> {
    new (message: string, payload?: T): CustomError<T>
    isTypeOf(err: any): err is CustomError<T>
}

export function createErrorClass<T>(
        type: string,
        messageFunction: MessageFunction<T> = message => message): CustomErrorClass<T> {

    return class extends Error {
        static isTypeOf(err: CustomError<any>): err is CustomError<T> {
            return err.type === type
        }

        type: string = type

        constructor(message: string, public payload: T) {
            super(messageFunction(message, payload))
        }
    }
}
