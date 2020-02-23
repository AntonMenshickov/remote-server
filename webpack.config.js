const path = require('path');

const {
    NODE_ENV = 'production',
} = process.env;

// variables
const isProduction =
    process.argv.indexOf('-p') >= 0 || NODE_ENV === 'production';
const nodemon = process.argv.indexOf('-nd') >= 0;
const outPath = path.join(__dirname, './build');

const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');

const backend = {
    entry: './backend/main.ts',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: path.resolve(outPath),
        filename: 'main.js',
        hotUpdateChunkFilename: 'hot-update.js',
        hotUpdateMainFilename: 'hot-update.json'
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'ts-loader',
                ]
            }
        ]
    },
    externals: [nodeExternals()],
    watch: !isProduction,
    plugins: nodemon ? [
        new WebpackShellPlugin({
            onBuildEnd: ['npm run run:dev']
        })
    ] : []
};


module.exports = [
    backend
];