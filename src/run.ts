/**
 * run.ts
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {magenta} from "colors/safe";

import server from "./server";
import {info} from "./logger";

const port = Number(process.argv[2]) || 5000;
server.listen(port, () => {
    info(magenta(`🍦 Serving on http://localhost:${port}`));
});
