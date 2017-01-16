import webpack from "webpack";
import path from "path";

import HtmlWebpackPlugin from "html-webpack-plugin";

import tslintConfig from "./tslint.json";

const isProduction = process.env.NODE_ENV === "production";

const allShared = {
    module: {
        preLoaders: [
            {
                test: /\.tsx$/,
                include: [path.resolve("src/app")],
                loader: "tslint",
            },
        ],

        loaders: [
            {
                test: /.json$/,
                loaders: ["json"],
            },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"],
            },
            {
                test: /\.tsx$/,
                include: [path.resolve("src/app")],
                loaders: ["react-hot", "ts"],
            },
        ],
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        // todo: generate an html file for each chunk
        new HtmlWebpackPlugin({
            inject: false,
            template: path.resolve("src/app/index.html"),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    debug: true,
    devtool: "source-map",
    output: {
        path: path.resolve("build"),
        publicpath: "/",
        filename: "[name].js",
    },
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
    entry: [
        path.resolve("src/app/index"),
    ],
};

const browser = {
    ...assetsShared,
    entry: [
        ...assetsShared.entry,
        ...(isProduction ? [] : ["webpack/hot/dev-server"]),
    ]
};

export default [browser];
