/**
 * AuthorInputView.tsx
 *
 * Created by Zander Otavka on 2/17/17.
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

import * as React from "react"

import {AuthorModel} from "./state/models"

export interface StateProps {
    index: number
    model: AuthorModel
    containerClass: string
    nameClass: string
    emailClass: string
}

export interface DispatchProps {
    onChange: (index: number, newModel: AuthorModel) => void
    onRemove: (index: number) => void
}

type Props = StateProps & DispatchProps

export default function AuthorInputView({model, index, onChange, onRemove, containerClass,
                                         nameClass, emailClass}: Props): JSX.Element {
    return (
        <div className={containerClass}>
            <input
                className={nameClass}
                name="authorName"
                type="text"
                value={model.name}
                onChange={(ev) => onChange(index, {...model, name: ev.target.value})}
                placeholder="Author Name"
                autoComplete="off"
                autoCapitalize="word"
            />

            <input
                className={emailClass}
                name="authorEmail"
                type="email"
                value={model.email}
                onChange={(ev) => onChange(index, {...model, email: ev.target.value})}
                placeholder="Author Email"
                autoComplete="off"
            />

            <button
                onClick={(ev) => {
                    ev.preventDefault()
                    onRemove(index)
                }}
            >
                Remove
            </button>
        </div>
    )
}
