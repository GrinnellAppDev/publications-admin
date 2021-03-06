/**
 * webpack.config.babel.js
 *
 * Created by Zander Otavka on 2/8/16.
 * Copyright (C) 2016  Grinnell AppDev.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import webpack from "webpack"
import path from "path"

import HtmlPlugin from "html-webpack-plugin"
import ExtractTextPlugin from "extract-text-webpack-plugin"
import InlineManifestPlugin from "inline-manifest-webpack-plugin"
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin"

const isProduction = process.env.NODE_ENV === "production"
const stage = process.env.STAGE || (isProduction ? "production" : "devstable")

const API_ROOTS_BY_STAGE = {
    devstable: "https://g2j7qs2xs7.execute-api.us-west-2.amazonaws.com/devstable",
    production: "https://3iqnjzs7w1.execute-api.us-west-2.amazonaws.com/production",
    zander: "https://cpckj13abg.execute-api.us-west-2.amazonaws.com/zander",
}

const API_ROOT = API_ROOTS_BY_STAGE[stage]
if (!API_ROOT) {
    throw new Error("No api root for that stage.")
}

const DEV_SERVER_PORT = 8080
const DEV_SERVER_HOST = "localhost"

const COGNITO_USER_POOL_ID = "us-west-2_UIAxO7cc3"
const COGNITO_CLIENT_ID = "2akq6q7qh6fdiv4n41iv20qvij"

const paths = {
    htmlTemplate: path.resolve("src/index.html"),
    clientEntry: path.resolve("src/client"),
    build: isProduction ? path.resolve("build") : path.resolve(".tmp"),
    devServer: `http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}/`,
}

const htmlMinifierConfig = {
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
}

export default {
    entry: paths.clientEntry,

    output: {
        filename: isProduction ? "[name].[hash].js" : "[name].js",
        path: paths.build,
        publicPath: isProduction ? "/" : paths.devServer,
    },

    devServer: {
        port: DEV_SERVER_PORT,
        host: DEV_SERVER_HOST,
    },

    cache: true,

    devtool: "source-map",

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "tslint-loader",
                enforce: "pre",
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
            {
                test: /\.sass$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader",
                    }, {
                        loader: "sass-loader",
                        options: {
                            indentedSyntax: true,
                        },
                    }],
                }),
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                include: [
                    path.resolve("node_modules/preact-compat/src"),
                    path.resolve("node_modules/especially"),
                ],
            },
        ],
    },

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),

        new webpack.optimize.AggressiveMergingPlugin({}),

        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(isProduction ? "production" : "dev"),
                API_ROOT: JSON.stringify(API_ROOT),
                COGNITO_USER_POOL_ID: JSON.stringify(COGNITO_USER_POOL_ID),
                COGNITO_CLIENT_ID: JSON.stringify(COGNITO_CLIENT_ID),
            },
        }),

        new webpack.LoaderOptionsPlugin({
            debug: !isProduction,
            ts: {
                configFileName: "tsconfig.json",
            },
            tslint: {
                configFile: path.resolve("tslint.json"),
            },
        }),

        new ExtractTextPlugin({
            filename: isProduction ? "[name].[contenthash].css" : "[name].css",
            allChunks: true,
        }),

        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest'],
            children: true,
        }),

        new InlineManifestPlugin(),

        new HtmlPlugin({
            inject: false,
            template: paths.htmlTemplate,
            minify: isProduction ? htmlMinifierConfig : false,
        }),

        ...(isProduction ? [
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                minimize: true,
                compress: {
                    drop_console: true,
                    screw_ie8: true,
                    sequences: true,
                    properties: true,
                    dead_code: true,
                    drop_debugger: true,
                    conditionals: true,
                    comparisons: true,
                    evaluate: true,
                    booleans: true,
                    loops: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    cascade: true,
                    negate_iife: true,
                    hoist_funs: true,
                    warnings: false,
                },
                mangle: {
                    screw_ie8: true,
                },
                output: {
                    screw_ie8: true,
                },
            }),

            new OptimizeCssAssetsPlugin(),
        ] : [
        ]),
    ],

    resolve: {
        extensions: [
            ".webpack.js",
            ".web.js",
            ".js",
            ".ts",
            ".tsx",
        ],

        ...(isProduction ? {
            alias: {
                "react": "preact-compat",
                "react-dom": "preact-compat",
                "create-react-class": "preact-compat/lib/create-react-class",
            },
        } : {
        }),

        symlinks: false,
    },
}
