var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'test', 'all.js'),
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'tests.js',
        libraryTarget: "umd"
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    cacheDirectory: true,
                }
            }
        ]
    },

    resolve: {
        extensions: ['', '.js'],
        modulesDirectories: ['src', 'node_modules']
    },

    node: {
        fs: 'empty'
    }
};
