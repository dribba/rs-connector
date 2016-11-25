var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: ['./test/all.js'],

    output: {
        filename: './build/tests.js'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
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
