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
import * as path from "path";

const app = express();
export default app;

app.use("/assets", express.static(path.resolve("app")));
app.get("/", (req, resp) => {
    resp.sendFile(path.resolve("app/index.html"));
});
