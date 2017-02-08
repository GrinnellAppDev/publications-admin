/**
 * client.dev.tsx
 *
 * Created by Zander Otavka on 1/15/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as React from "react";
import {render} from "react-dom";
// import {AppContainer} from "react-hot-loader";

import App from "./app/App";

function renderComponent(component: JSX.Element): void {
    render(component, document.getElementById("root"));
}

renderComponent(<App/>);

declare const module: any;

if (module.hot) {
    module.hot.accept("./app/App", () => {
        renderComponent(<App/>);
    });
}
