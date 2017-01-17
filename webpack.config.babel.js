import webpack from "webpack";
import path from "path";

import HtmlPlugin from "html-webpack-plugin";
import CleanPlugin from "clean-webpack-plugin";

import packageConfig from "./package.json";
import tslintConfig from "./tslint.json";

const isProduction = process.env.NODE_ENV === "production";

const src = path.resolve("src");
const build = isProduction ? path.resolve("build") : path.resolve(".tmp");
const serverOutput = path.resolve(build, "server");

export const paths = {
    src,
    clientEntry: path.resolve(src, "client/index.tsx"),
    clientHtml: path.resolve(src, "client/index.html"),
    serverEntry: path.resolve(src, "server", isProduction ? "index.ts" : "app.ts"),
    build,
    clientOutput: path.resolve(build, "client"),
    serverOutput,
    serverOutputFile: path.join(serverOutput, "index.js"),
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
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"],
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
        path: paths.clientOutput,
        publicPath: "/assets",
        filename: "[name].js",
    },
    devtool: "source-map",
    plugins: [
        ...shared.plugins,
        // todo: generate an html file for each chunk
        new HtmlPlugin({
            inject: false,
            template: paths.clientHtml,
        }),
        new CleanPlugin([paths.clientOutput]),
    ],
};

const server = {
    ...shared,
    target: "node",
    entry: paths.serverEntry,
    output: {
        path: paths.serverOutput,
        filename: path.basename(paths.serverOutputFile),
        libraryTarget: 'commonjs',
        ...(isProduction ? {} : {library: "app"})
    },
    externals: [
        {"assets": paths.serverAssetFile},
        /^(?!\.|\/).+/i, // all non-relative imports
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: [
        ...shared.plugins,
        new CleanPlugin([paths.serverOutput]),
    ]
};

export default [browserAssets, server];
