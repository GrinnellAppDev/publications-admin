/**
 * AuthorInput.tsx
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

import React from "react"

import {AuthorModel} from "./state/articles"

interface Props {
    index: number
    model: AuthorModel
    containerClass: string
    nameClass: string
    emailClass: string
    onChange: (index: number, newModel: AuthorModel) => void
    onRemove: (index: number) => void
}

export default ({model, index, onChange, ...props}: Props) =>
    <div className={props.containerClass}>
        <input
            className={props.nameClass}
            name="authorName"
            type="text"
            value={model.name}
            onChange={(ev) => onChange(index, {...model, name: ev.target.value})}
            placeholder="Author Name"
            autoComplete="off"
            autoCapitalize="word"
        />

        <input
            className={props.emailClass}
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
                props.onRemove(index)
            }}
        >
            Remove
        </button>
    </div>
