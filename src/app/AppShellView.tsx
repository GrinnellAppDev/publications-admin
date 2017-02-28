/**
 * AppShellView.tsx
 *
 * Created by Zander Otavka on 2/10/17.
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
import FlipMove from "react-flip-move"

import {ToastModel} from "./state/models"
import Toast from "./Toast"
import block from "./bem"

import "./AppShellView.scss"

const b = block("AppShellView")

export interface StateProps {
    children?: React.ReactNode
    toasts: ReadonlyArray<ToastModel>
}

export interface DispatchProps {
}

type Props = StateProps & DispatchProps

export default function AppShellView({children, toasts}: Props): JSX.Element {
    return (
        <div className={b()}>
            <aside className={b("toasts")}>
                <FlipMove
                    maintainContainerHeight={false}
                    leaveAnimation={{
                        from: {
                            transform: "translate(0, -100%)",
                            opacity: "1",
                        },
                        to: {
                            transform: "translate(-100%, -100%)",
                            opacity: "0",
                        },
                    }}
                >
                    {toasts.map(toast =>
                        <div className={b("toast-wrapper")} key={toast.id}>
                            <Toast model={toast}/>
                        </div>
                    )}
                </FlipMove>
            </aside>

            {children}
        </div>
    )
}
