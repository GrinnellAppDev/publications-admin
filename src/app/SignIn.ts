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
import {CognitoUserSession} from "amazon-cognito-identity-js"

import {saveAuthInfo} from "./state/actions"
import SignInView, {DispatchProps} from "./SignInView"

export default connect<{}, DispatchProps, {}>(
    undefined,
    (dispatch) => ({
        onSubmit: async (username, password) => {
            const {AuthenticationDetails, CognitoUserPool, CognitoUser} =
                await System.import(
                    /* webpackChunkName: "aws-cognito" */
                    "amazon-cognito-identity-js"
                )

            const authDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
            })

            const userPool = new CognitoUserPool({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                ClientId: process.env.COGNITO_CLIENT_ID,
            })

            const user = new CognitoUser({
                Username: username,
                Pool: userPool,
            })

            function onSuccess(session: CognitoUserSession): void {
                dispatch(saveAuthInfo({
                    username,
                    token: session.getAccessToken().getJwtToken(),
                }))
            }

            function onFailure(err: Error): void {
                // dispatch(createToast({text: err.message}))
            }

            user.authenticateUser(authDetails, {
                onSuccess,
                onFailure,

                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // TODO: do something better than a prompt
                    const newPassword = prompt(
                        "Enter new password (must be over 16 characters long and contain both " +
                        "uppercase and lowercase letters)"
                    )

                    user.completeNewPasswordChallenge(newPassword, {}, {onSuccess, onFailure})
                },
            })
        }
    }),
)(
    SignInView
)
