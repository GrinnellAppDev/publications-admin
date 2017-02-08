/**
 * dev-server.js
 *
 * Created by Zander Otavka on 2/7/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";

import config, {devServerConfig} from "./webpack.config.babel";

const server = new WebpackDevServer(webpack(config), devServerConfig);

server.listen(devServerConfig.port);
