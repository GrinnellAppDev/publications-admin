/**
 * ToastView.tsx
 *
 * Created by Zander Otavka on 2/23/17.
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

import {ToastModel} from "./state/models"

import block from "./style/bem"

import "./ToastView.scss"

export interface StateProps {
}

export interface DispatchProps {
    onButtonClick: (toastId: string, buttonId: string) => void
}

export interface OwnProps {
    model: ToastModel
}

type Props = StateProps & DispatchProps & OwnProps

export default function ToastView({model, onButtonClick}: Props): JSX.Element {
    const b = block("ToastView")

    return (
        <div className={b()}>
            <span className={b("text")}>{model.text}</span>

            {model.buttons.map((button) =>
                <button
                    key={button.id}
                    className={b("button")}
                    onClick={() => onButtonClick(model.id, button.id)}
                >
                    {button.text}
                </button>
            )}
        </div>
    )
}
