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
import webpack from "webpack";
import browserSync from "browser-sync";
import debounce from "debounce";

import webpackConfig, {paths} from "./webpack.config.babel";

const proxyPort = Number(process.argv[2]) || 3000;
const expressPort = proxyPort + 10;

const browserSyncServer = browserSync.create();
browserSyncServer.init({
    proxy: `localhost:${expressPort}`,
    port: proxyPort,
    open: false,
});

let listener = null;
function restartExpressServer() {
    Object.keys(require.cache).forEach(key => {
        if (key.indexOf(paths.serverOutput) === 0)
            delete require.cache[key];
    });

    if (listener) listener.close();
    listener = require(paths.serverOutputFile).app.default.listen(expressPort, console.error);

    browserSyncServer.reload();
}

process.chdir(paths.build);
webpack(webpackConfig).watch({}, debounce(restartExpressServer, 500));
