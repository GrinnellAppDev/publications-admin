/**
 * server.ts
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
import App from "./app/app";

import logger from "./logger";

const app = express();
app.engine("html", mustache);
app.set("views", resolve("assets"));

app.use(logger);

app.use("/assets", express.static(resolve("assets")));
app.get("/", (req, resp) => {
    resp.render("index.html", {renderedDOM: render(h(App, {}))});
});

app.use((request, response) => {
    // todo: send a nice 404 page, something along the lines of being lost
    // https://tau0.files.wordpress.com/2012/09/montana_dirt_road.jpg
    response.sendStatus(404);
});

export default app;
