/**
 * SignIn.ts
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

import {connect} from "react-redux"
import {AuthenticationDetails, CognitoUserPool, CognitoUser,
        CognitoUserSession} from "amazon-cognito-identity-js"

import {saveAuthToken} from "./state/actions"
import SignInView, {DispatchProps} from "./SignInView"

export default connect<{}, DispatchProps, {}>(
    undefined,
    (dispatch) => ({
        onSubmit: (username, password) => {
            const authDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
            })

            const userPool = new CognitoUserPool({
                UserPoolId: "us-west-2_UIAxO7cc3",
                ClientId: "2akq6q7qh6fdiv4n41iv20qvij",
            })

            const user = new CognitoUser({
                Username: username,
                Pool: userPool,
            })

            function onSuccess(session: CognitoUserSession): void {
                dispatch(saveAuthToken({
                    token: session.getAccessToken().getJwtToken(),
                }))
            }

            function onFailure(err: any): void {
                console.error("auth failed", err)
            }

            user.authenticateUser(authDetails, {
                onSuccess,
                onFailure,

                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // TODO: do something better than a prompt
                    const newPassword = prompt("Enter new password")
                    user.completeNewPasswordChallenge(newPassword, {}, {onSuccess, onFailure})
                },
            })
        }
    }),
)(
    SignInView
)
