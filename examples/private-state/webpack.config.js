var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry:  path.join(__dirname, 'src', 'index.js'),

    output: {
        path: path.join(__dirname, './build'),
        filename: 'main.js',
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
        modulesDirectories: ['src', 'node_modules'],
        alias: {
            'rs-connector': path.join(__dirname, '..', '..', 'build', 'rs-connector.js'),
        }
    },

    node: {
        fs: 'empty'
    }
};
