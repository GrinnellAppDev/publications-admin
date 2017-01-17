/**
 * server/app.ts
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from "express";
import {resolve} from "path";
import {mustache} from "consolidate";
import {h} from "preact";
import * as render from "preact-render-to-string";

const app = express();
export default app;
app.engine("html", mustache);
app.set("views", resolve("client"));

app.use("/assets", express.static(resolve("client")));
app.get("/", (req, resp) => {
    const initialState = null;
    const root = h(require("assets").app.default, {initialState});
    resp.render("index.html", {renderedDOM: render(root)});
});
