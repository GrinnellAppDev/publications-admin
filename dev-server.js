/**
 * watch.js
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import path from "path";
import fs from "fs";
import webpack from "webpack";
import browserSync from "browser-sync";
import debounce from "debounce";

import webpackConfig, {paths} from "./webpack.config.babel";

const browserSyncPort = Number(process.argv[2]) || 3000;
const expressPort = browserSyncPort + 10;

const browserSyncServer = browserSync.create();
browserSyncServer.init({
    proxy: `localhost:${expressPort}`,
    port: browserSyncPort,
    open: false,
});

let listener = null;
function restartExpressServer() {
    const serverFile = require.resolve(path.join(paths.build, "main"));
    delete require.cache[serverFile];

    if (listener) listener.close();
    listener = require(serverFile).app.default.listen(expressPort, console.error);

    browserSyncServer.reload();
}

try {
    fs.mkdirSync(paths.build);
} catch (e) {
    console.info(`Path "${paths.build}" already exists.`);
}

process.chdir(paths.build);
webpack(webpackConfig).watch({}, debounce(restartExpressServer, 700));
