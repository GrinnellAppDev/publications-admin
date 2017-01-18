import webpack from "webpack";
import path from "path";

import HtmlPlugin from "html-webpack-plugin";

import packageConfig from "./package.json";
import tslintConfig from "./tslint.json";

const isProduction = process.env.NODE_ENV === "production";

export const paths = {
    htmlTemplate: path.resolve("src/template.html"),
    clientEntry: path.resolve("src/client"),
    serverEntry: path.resolve("src", isProduction ? "run" : "server"),
    build: isProduction ? path.resolve("build") : path.resolve(".tmp"),
};

const shared = {
    output: {
        filename: "[name].js",
    },
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
        new webpack.optimize.OccurrenceOrderPlugin(),
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
        configuration: tslintConfig,
    },
};

const browserAssets = {
    ...shared,
    entry: paths.clientEntry,
    output: {
        ...shared.output,
        path: path.resolve(paths.build, "assets"),
        publicPath: "/assets",
    },
    module: {
        ...shared.module,
        loaders: [
            ...shared.module.loaders,
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"],
            },
        ],
    },
    devtool: "source-map",
    plugins: [
        ...shared.plugins,
        // todo: generate an html file for each chunk
        new HtmlPlugin({
            inject: false,
            template: paths.htmlTemplate,
        }),
    ],
};

const server = {
    ...shared,
    target: "node",
    entry: paths.serverEntry,
    output: {
        ...shared.output,
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
    ]
};

export default [browserAssets, server];
