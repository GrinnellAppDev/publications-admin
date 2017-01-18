/**
 * logger.ts
 *
 * Created by Zander Otavka on 1/11/16.
 * Copyright (C) 2016 Zander Otavka.  All rights reserved.
 *
 * Distributed under the GNU General Public License, Version 3.
 * See the accompanying file LICENSE or http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as httpEmojis from "http-status-emojis";
import * as padLeft from "pad-left";
import {gray, red, green, blue, yellow, cyan, magenta} from "colors/safe";
import {Request, Response, NextFunction} from "express";

type TemplateFunction<T> = (strings: TemplateStringsArray, ...values: any[]) => T;

function padNums(digits: number, padding: string): TemplateFunction<string> {
    return (strings, ...values) => {
        let out = strings[0];
        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] === "number") {
                out += padLeft(String(values[i]), digits, padding);
            } else {
                out += String(values[i]);
            }

            out += strings[i + 1].replace(/\s+/, " ");
        }
        return out;
    };
}

function getPrefix(): string {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear() % 100;
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const tz = date.getTimezoneOffset();
    const tzHours = Math.floor(tz / 60);
    const tzMinutes = tz % 60;
    const tzSign = tz > 0 ? "-" : "+"; // it's swapped on purpose
    return gray(
        padNums(2, "0") `[${month}/${day}/${year} ${hour}:${minute}:${second}
                          UTC${tzSign}${tzHours}${tzMinutes}]`
    );
}

export function log(message: string): void {
    console.info(`${getPrefix()} ${message}`);
}

export function warn(message: string): void {
    const coloredMessage = yellow(message);
    console.info(`${getPrefix()} ${coloredMessage}`);
}

export function error(message: string): void {
    const coloredMessage = red(message);
    console.info(`${getPrefix()} ${coloredMessage}`);
}

/**
 * Colorize an HTTP status code.
 *
 * @param status HTTP status code.
 * @returns Colorized string representation of status code.
 */
function coloredStatus(status: string | number): string {
    const str = String(status);
    switch (Math.floor(Number(status) / 100)) {
        case 1:
            return gray(str);
        case 2:
            return green(str);
        case 3:
            return magenta(str);
        case 4:
            return yellow(str);
        case 5:
            return red(str);
        default:
            return str;
    }
}

/**
 * Colorize an HTTP method.
 *
 * @param method An HTTP method string, can be any case.
 * @returns The method colorized and in the same case.
 */
function coloredMethod(method: string): string {
    switch (method.toLowerCase()) {
        case "get":
            return gray(method);
        case "post":
            return blue(method);
        case "put":
        case "patch":
            return magenta(method);
        case "delete":
            return cyan(method);
        default:
            return method;
    }
}

export default function logger(request: Request, response: Response, next: NextFunction): void {
    request.on("end", () => {
        const status = response.statusCode;
        const emoji = httpEmojis[status] || "📡";
        const statusStr = coloredStatus(status);
        const method = coloredMethod(request.method);
        const requestUri = request.originalUrl;
        log(`${emoji} ${statusStr} ${gray("←")} ${method} ${requestUri}`);
    });
    next();
}
