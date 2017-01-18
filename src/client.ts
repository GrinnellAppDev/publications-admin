/**
 * client.ts
 *
 * Created by Zander Otavka on 1/15/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import "es6-promise";
import "whatwg-fetch";

import {h, render} from "preact";

import App, {ROOT_ID} from "./app/app";

render(h(App, {}), document.body, document.getElementById(ROOT_ID));
