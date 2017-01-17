/**
 * server/index.ts
 *
 * Created by Zander Otavka on 1/16/17.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import app from "./app";

const port = Number(process.argv[2]) || 5000;
app.listen(port, () => {
    console.info(`Serving on http://localhost:${port}`);
});
