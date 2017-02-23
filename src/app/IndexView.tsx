/**
 * IndexView.tsx
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

export interface StateProps {
    isLoading: boolean
    hasPublications: boolean
}

export interface DispatchProps {
}

type Props = StateProps & DispatchProps

export default function IndexPage({isLoading, hasPublications}: Props): JSX.Element {
    return (isLoading || hasPublications) ? (
        <div>Loading...</div>
    ) : (
        <div>
            <h1>No Publications</h1>
            <p>Couldn't find any publications.</p>
        </div>
    )
}
