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
const serverAssetFileName = "assets.js";
const serverFileName = "index.js";

export const paths = {
    src,
    clientEntry: path.resolve(src, "client/index.tsx"),
    clientHtml: path.resolve(src, "client/index.html"),
    serverAssetEntry: path.resolve(src, "client/app.tsx"),
    serverEntry: path.resolve(src, "server", isProduction ? "index" : "app"),
    build,
    clientOutput: path.resolve(build, "client"),
    serverOutput,
    serverAssetFileName,
    serverAssetFile: path.join(serverOutput, serverAssetFileName),
    serverFileName,
    serverFile: path.join(serverOutput, serverFileName),
};

const allShared = {
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
        new CleanPlugin([paths.clientOutput, paths.serverOutput], {verbose: false}),
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

const assetsShared = {
    ...allShared,
};

const browserAssets = {
    ...assetsShared,
    entry: paths.clientEntry,
    output: {
        path: paths.clientOutput,
        publicPath: "/assets",
        filename: "[name].js",
    },
    devtool: "source-map",
    plugins: [
        ...assetsShared.plugins,
        // todo: generate an html file for each chunk
        new HtmlPlugin({
            inject: false,
            template: paths.clientHtml,
        }),
    ],
};

const serverAssets = {
    ...assetsShared,
    target: "node",
    entry: paths.serverAssetEntry,
    output: {
        path: paths.serverOutput,
        filename: paths.serverAssetFileName,
        library: "app",
        libraryTarget: "commonjs",
    },
};

const server = {
    ...allShared,
    target: "node",
    entry: paths.serverEntry,
    output: {
        path: paths.serverOutput,
        filename: paths.serverFileName,
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
};

export default [browserAssets, serverAssets, server];
