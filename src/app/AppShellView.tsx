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

import React from "react"
import FlipMove from "react-flip-move"

import {ToastModel} from "./state/models"
import ToastView from "./ToastView"
import block from "./style/bem"

import "./AppShellView.scss"

export interface StateProps {
    isSignedIn: boolean
    isAuthLoading: boolean
    username: string
    toasts: ReadonlyArray<ToastModel>
}

export interface DispatchProps {
    onToastButtonClick: (toastId: string, buttonId: string) => void
    onSignIn: (username: string, password: string) => void
    onSignOut: () => void
}

type Props = StateProps & DispatchProps & React.Props<void>

const toastEnterAnimation = {
    from: {
        transform: "translateX(-100%)",
        opacity: "0",
    },
    to: {
        transform: "",
        opacity: "1",
    },
}

const toastLeaveAnimation = {
    from: {
        transform: "translate(0, -100%)",
        opacity: "1",
    },
    to: {
        transform: "translate(-100%, -100%)",
        opacity: "0",
    },
}

export default function AppShellView(props: Props): JSX.Element {
    const b = block("AppShellView")

    return (
        <div className={b()}>
            <div className={b("auth")}>
                {(props.isAuthLoading) ? (
                    <div>Signing In...</div>
                ) : (props.isSignedIn) ? (
                    <div>
                        <span>{props.username} </span>
                        <button onClick={props.onSignOut}>Sign Out</button>
                    </div>
                ) : (
                    <form
                        onSubmit={(ev) => {
                            ev.preventDefault()

                            const form = ev.currentTarget
                            const usernameInput = form.querySelector("[name=username]") as
                                HTMLInputElement
                            const passwordInput = form.querySelector("[name=password]") as
                                HTMLInputElement

                            props.onSignIn(usernameInput.value, passwordInput.value)
                        }}
                    >
                        <input type="text" name="username" placeholder="Username"/>
                        <input type="password" name="password" placeholder="Password"/>
                        <input type="submit" value="Sign In"/>
                    </form>
                )}
            </div>

            {props.children}

            <aside className={b("toasts")}>
                <FlipMove
                    appearAnimation={toastEnterAnimation}
                    enterAnimation={toastEnterAnimation}
                    leaveAnimation={toastLeaveAnimation}
                    typeName="ul"
                    duration={150}
                >
                    {props.toasts.map((toast) =>
                        <li className={b("toast-wrapper")} key={toast.id}>
                            <ToastView model={toast} onButtonClick={props.onToastButtonClick}/>
                        </li>
                    )}
                </FlipMove>
            </aside>
        </div>
    )
}
