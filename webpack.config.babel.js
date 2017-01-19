import webpack from "webpack";
import path from "path";

import HtmlPlugin from "html-webpack-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import InlineManifestPlugin from "inline-manifest-webpack-plugin";

const isProduction = process.env.NODE_ENV === "production";

export const paths = {
    htmlTemplate: path.resolve("src/index.html"),
    clientEntry: path.resolve("src/client"),
    serverEntry: path.resolve("src", isProduction ? "run" : "server"),
    build: isProduction ? path.resolve("build") : path.resolve(".tmp"),
};

const htmlMinifierConfig = {
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
};

const shared = {
    module: {
        preLoaders: [
            {
                test: /\.tsx$/,
                loader: "tslint",
            },
        ],
        loaders: [
            {
                test: /\.tsx?$/,
                loader: "ts",
            },
            {
                test: /.json$/,
                loaders: ["json"],
            },
        ],
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.optimize.AggressiveMergingPlugin({}),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
    ],
    debug: !isProduction,
    cache: true,
    resolve: {
        extensions: [
            "",
            ".webpack.js",
            ".web.js",
            ".js",
            ".ts",
            ".tsx",
        ],
        alias: {
            "react": "preact-compat",
            "react-dom": "preact-compat",
        },
    },
    ts: {
        configFileName: "tsconfig.json",
    },
    tslint: {
        configFile: path.resolve("tslint.json"),
    },
};

const browserAssets = {
    ...shared,
    entry: paths.clientEntry,
    output: {
        filename: isProduction ? "[name].[hash].js" : "[name].js",
        path: path.resolve(paths.build, "assets"),
        publicPath: "/assets",
    },
    module: {
        ...shared.module,
        loaders: [
            ...shared.module.loaders,
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(["css", "sass"]),
            },
        ],
    },
    devtool: "source-map",
    plugins: [
        ...shared.plugins,
        new ExtractTextPlugin(isProduction ? "[name].[contenthash].css" : "[name].css", {
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
        ] : [
        ]),
    ],
};

const server = {
    ...shared,
    target: "node",
    entry: paths.serverEntry,
    output: {
        filename: "main.js",
        path: paths.build,
        libraryTarget: "commonjs",
        ...(isProduction ? {} : {library: "app"})
    },
    module: {
        ...shared.module,
        loaders: [
            ...shared.module.loaders,
            {
                test: /\.scss$/,
                loader: "null",
            },
        ],
    },
    externals: [
        /^(?!\.|\/).+/i, // all non-relative imports
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: [
        ...shared.plugins,
        ...(isProduction ? [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    screw_ie8: true,
                    dead_code: true,
                    warnings: false,
                },
            }),
        ] : [
        ]),
    ]
};

export default [browserAssets, server];
