var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src', 'Channel.js'),

    output: {
        path: path.join(__dirname, 'build'),
        filename: 'rs-connector.js',
        libraryTarget: "umd"
    },
    externals: {
        react: 'react',
        'reactive-store': 'reactive-store'
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
