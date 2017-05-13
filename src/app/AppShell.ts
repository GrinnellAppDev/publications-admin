/**
 * AppShell.ts
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

import {connect} from "react-redux"

import {StateModel} from "./state/models"
import {signIn, signOut, closeToast} from "./state/actions"

import AppShellView, {StateProps, DispatchProps} from "./AppShellView"

export default connect<StateProps, DispatchProps, {}>(
    ({auth, toasts}: StateModel) => ({
        isSignedIn: !!auth.token,
        isAuthLoading: auth.isLoading,
        username: auth.username,
        toasts,
    }),

    (dispatch) => ({
        onSignIn: (username, password) => {
            dispatch(signIn({username, password}))
        },

        onSignOut: () => {
            dispatch(signOut({}))
        },

        onToastButtonClick: (toastId, buttonId) => {
            dispatch(closeToast({toastId, buttonId}))
        },
    }),
)(
    AppShellView
)
