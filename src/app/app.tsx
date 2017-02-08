/**
 * App.tsx
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as React from "react";

import "./app.scss";

export default class App extends React.Component<{}, {}> {
    render(): JSX.Element {
        return (
            <div>
                <span className="foo">
                    Hello world, how are you doing?
                </span>
            </div>
        );
    }
}
