/**
 * app.tsx
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {h, Component} from "preact";

import "./app.scss";

export const ROOT_ID = "root";

export default class App extends Component<{}, {}> {
    render(): JSX.Element {
        return (
            <div id={ROOT_ID}>
                <span class="foo">
                    Hello World
                </span>
            </div>
        );
    }
}
