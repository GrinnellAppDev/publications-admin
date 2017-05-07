/**
 * SignInView.tsx
 *
 * Created by Zander Otavka on 5/6/17.
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

export interface DispatchProps {
    onSubmit: (username: string, password: string) => void
}

type Props = DispatchProps

export default function SignInView({onSubmit}: Props): JSX.Element {
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault()
                const form = ev.currentTarget
                const usernameInput = form.querySelector("[name=username]") as HTMLInputElement
                const passwordInput = form.querySelector("[name=password]") as HTMLInputElement
                onSubmit(usernameInput.value, passwordInput.value)
            }}
        >
            <input type="text" name="username" placeholder="Username"/>
            <input type="password" name="password" placeholder="Password"/>
            <input type="submit" value="Sign In"/>
        </form>
    )
}
