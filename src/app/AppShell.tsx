/**
 * AppShell.tsx
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
import FlipMove from "react-flip-move"

import {connect} from "react-redux"

import {ToastModel} from "./state/toasts"
import {StateModel} from "./state/store"
import {authActions, ChangePasswordModel} from "./state/auth"
import {toastsActions} from "./state/toasts"

import Toast from "./Toast"

import block from "./style/bem"
import "./AppShell.sass"

interface StateProps {
    isSignedIn: boolean
    isAuthLoading: boolean
    username: string
    changePassword: ChangePasswordModel
    toasts: ReadonlyArray<ToastModel>
}

interface DispatchProps {
    onSignIn: (ev: React.FormEvent<HTMLFormElement>) => void
    onSignOut: () => void
    onNewPasswordChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    onNewPasswordSubmit: (ev: React.FormEvent<HTMLFormElement>) => void
    onNewPasswordCancel: (ev: React.MouseEvent<HTMLElement>) => void
    onToastButtonClick: (toastId: string, buttonId: string) => void
}

interface OwnProps {
}

const b = block("AppShell")

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

export default connect<StateProps, DispatchProps, OwnProps>(
    ({auth, toasts}: StateModel) => ({
        isSignedIn: !!auth.token,
        isAuthLoading: auth.isLoading,
        username: auth.username,
        changePassword: auth.changePassword,
        toasts,
    }),

    (dispatch) => ({
        onSignIn: (ev) => {
            ev.preventDefault()

            const form = ev.currentTarget
            const usernameInput = form.querySelector("[name=username]") as HTMLInputElement
            const passwordInput = form.querySelector("[name=password]") as HTMLInputElement

            dispatch(authActions.signIn({
                username: usernameInput.value,
                password: passwordInput.value,
            }))
        },

        onSignOut: () => {
            dispatch(authActions.signOut({}))
        },

        onNewPasswordChange: (ev) => {
            const form = ev.currentTarget.form
            const input1 = form.querySelector("[name=field1]") as HTMLInputElement
            const input2 = form.querySelector("[name=field2]") as HTMLInputElement

            dispatch(authActions.newPasswordChange({
                field1: input1.value,
                field2: input2.value,
            }))
        },

        onNewPasswordSubmit: (ev) => {
            ev.preventDefault()

            const form = ev.currentTarget
            const input1 = form.querySelector("[name=field1]") as HTMLInputElement
            const input2 = form.querySelector("[name=field2]") as HTMLInputElement

            dispatch(authActions.newPasswordSubmit({
                field1: input1.value,
                field2: input2.value,
            }))

            input1.value = ""
            input2.value = ""
        },

        onNewPasswordCancel: (ev) => {
            ev.preventDefault()
            dispatch(authActions.newPasswordCancel({}))
        },

        onToastButtonClick: (toastId, buttonId) => {
            dispatch(toastsActions.close({toastId, buttonId}))
        },
    }),
)
(function AppShell({changePassword, ...props}) {
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
                    <form onSubmit={props.onSignIn}>
                        <input type="text" name="username" placeholder="Username"/>
                        <input type="password" name="password" placeholder="Password"/>
                        <input type="submit" value="Sign In"/>
                    </form>
                )}
            </div>

            {changePassword.isShown &&
                <div className={b("change-password")}>
                    <div
                        className={b("change-password-backdrop")}
                        onClick={props.onNewPasswordCancel}
                    />

                    <div className={b("change-password-dialogue")}>
                        <h2 className={b("change-password-title")}>Change Password</h2>

                        <p>You must create a new password to sign in.</p>

                        <ul>
                            <li
                                className={b("change-password-requirement", {
                                    "valid": changePassword.isCorrectCharacters,
                                })}
                            >
                                Contains capital and lowercase letters
                            </li>
                            <li
                                className={b("change-password-requirement", {
                                    "valid": changePassword.isCorrectLength,
                                })}
                            >
                                Longer than 16 characters
                            </li>
                            <li
                                className={b("change-password-requirement", {
                                    "valid": changePassword.isMatching,
                                })}
                            >
                                Passwords match
                            </li>
                        </ul>

                        <form onSubmit={props.onNewPasswordSubmit}>
                            <input
                                className={b("change-password-input")}
                                type="password"
                                name="field1"
                                placeholder="New Password"
                                onChange={props.onNewPasswordChange}
                            />
                            <input
                                className={b("change-password-input")}
                                type="password"
                                name="field2"
                                placeholder="Confirm Password"
                                onChange={props.onNewPasswordChange}
                            />

                            <button
                                className={b("change-password-button", "cancel")}
                                onClick={props.onNewPasswordCancel}
                            >
                                Cancel
                            </button>

                            <input
                                className={b("change-password-button", "submit")}
                                type="submit"
                                value="Change Password"
                                disabled={
                                    !changePassword.isCorrectCharacters ||
                                    !changePassword.isCorrectLength ||
                                    !changePassword.isMatching
                                }
                            />
                        </form>
                    </div>
                </div>
            }

            {props.children}

            <aside className={b("toasts")}>
                <FlipMove
                    typeName="ul"
                    className={b("toasts-list")}
                    appearAnimation={toastEnterAnimation}
                    enterAnimation={toastEnterAnimation}
                    leaveAnimation={toastLeaveAnimation}
                    duration={150}
                >
                    {props.toasts.map((toast) =>
                        <li className={b("toast-wrapper")} key={toast.id}>
                            <Toast model={toast} onButtonClick={props.onToastButtonClick}/>
                        </li>
                    )}
                </FlipMove>
            </aside>
        </div>
    )
})
