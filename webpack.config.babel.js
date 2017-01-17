import webpack from "webpack";
import path from "path";

import HtmlPlugin from "html-webpack-plugin";
import CleanPlugin from "clean-webpack-plugin";

import packageConfig from "./package.json";
import tslintConfig from "./tslint.json";

const isProduction = process.env.NODE_ENV === "production";

const paths = {
    src: path.resolve("src"),
    clientEntry: path.resolve("src/client/index"),
    clientHtml: path.resolve("src/client/index.html"),
    serverEntry: path.resolve("src/server/index"),
    build: path.resolve("build"),
    clientOutput: path.resolve("build/app"),
    serverOutput: path.resolve("build/server"),
};

const tsloader = (isHot = false) => ({
    test: /\.tsx?$/,
    include: [paths.src],
    loaders: [
        ...(isHot ? ["react-hot"] : []),
        "ts"
    ],
});

const allShared = {
    module: {
        preLoaders: [
            {
                test: /\.tsx$/,
                include: [paths.src],
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
        ],
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        ...(isProduction ? [
            new webpack.optimize.OccurrenceOrderPlugin(),
            new CleanPlugin([paths.build])
        ] : []),
    ],
    debug: !isProduction,
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
        paths.clientEntry,
    ],
};

const browser = {
    ...assetsShared,
    output: {
        path: paths.clientOutput,
        publicPath: "/assets",
        filename: "[name].js",
    },
    module: {
        ...assetsShared.module,
        loaders: [
            ...assetsShared.module.loaders,
            tsloader(!isProduction),
        ],
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

const server = {
    ...allShared,
    target: "node",
    entry: [
        paths.serverEntry,
    ],
    output: {
        path: paths.serverOutput,
        filename: "index.js",
        libraryTarget: 'commonjs',
    },
    module: {
        ...allShared.module,
        loaders: [
            ...allShared.module.loaders,
            tsloader(),
        ],
    },
    externals: [
        /^(?!\.|\/).+/i, // all non-relative imports
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
};

export default [browser, server];
