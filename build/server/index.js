(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * server/app.ts
	 *
	 * Created by Zander Otavka on 1/16/17.
	 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
	 *
	 * Distributed under the GNU General Public License, Version 3.
	 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
	 */
	"use strict";
	var express = __webpack_require__(3);
	var path = __webpack_require__(4);
	var app = express();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = app;
	app.use("/assets", express.static(path.resolve("app")));
	app.get("/", function (req, resp) {
	    resp.sendFile(path.resolve("app/index.html"));
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * server/index.ts
	 *
	 * Created by Zander Otavka on 1/16/17.
	 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
	 *
	 * Distributed under the GNU General Public License, Version 3.
	 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
	 */
	"use strict";
	var app_1 = __webpack_require__(1);
	var port = Number(process.argv[2]) || 5000;
	app_1.default.listen(port, function () {
	    console.info("Serving on http://localhost:" + port);
	});


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ }
/******/ ])));