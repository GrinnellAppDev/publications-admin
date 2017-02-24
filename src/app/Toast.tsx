/**
 * Toast.tsx
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

import * as React from "react"
import {connect} from "react-redux"
import {block} from "react-bem-helper"

import {ToastModel, ToastActionModel} from "./state/models"
import {toastActions, closeToast, AnyAction} from "./state/actions"

import "./Toast.scss"

interface DispatchProps {
    dispatch: (action: AnyAction) => any
}

interface OwnProps {
    model: ToastModel
}

type Props = OwnProps & DispatchProps

interface ComponentState {
    timeoutId: number
}

const b = block("Toast")

export default connect<{}, DispatchProps, OwnProps>(undefined, dispatch => ({dispatch}))(
    class Toast extends React.PureComponent<Props, ComponentState> {
        private dispatch(action: ToastActionModel): void {
            const {dispatch, model} = this.props
            dispatch(closeToast({id: model.id}))
            window.clearTimeout(this.state.timeoutId)

            if (action !== undefined) {
                dispatch(toastActions[action.type](...action.args))
            }
        }

        componentDidMount(): void {
            const {model} = this.props
            const now = Date.now()
            const expiration = model.timeCreated.valueOf() + model.duration
            this.setState({
                timeoutId: window.setTimeout(() => this.dispatch(model.expireAction),
                                             expiration - now),
            })
        }

        render(): JSX.Element {
            const {model} = this.props
            return (
                <div className={b()}>
                    <span className={b("text")}>{model.text}</span>

                    {model.buttons.map(button =>
                        <button
                            className={b("button")}
                            onClick={() => this.dispatch(button.action)}
                        >
                            {button.text}
                        </button>
                    )}

                    <button
                        className={b("button", "close")}
                        onClick={() => this.dispatch(model.cancelAction)}
                    >
                        Close
                    </button>
                </div>
            )
        }
    }
)
