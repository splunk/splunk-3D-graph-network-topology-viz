var webpack = require('webpack');
var path = require('path');

module.exports = {
    // devtool: "eval-cheap-source-map",
    // mode: "development",
    mode: "production",
    entry: {
        filename: path.join(__dirname, 'src') + '/visualization_source.js'
    },
    resolve: {
        // To avoid [WARNING: Multiple instances of Three.js being imported.]
        alias: {
            three: path.resolve(__dirname, 'node_modules/three')
        },
    },
    performance: {
        hints: false
    },
    output: {
        path: path.resolve(__dirname),
        filename: 'visualization.js',
        libraryTarget: 'amd'
    },
    externals: [
        'api/SplunkVisualizationBase',
        'api/SplunkVisualizationUtils'
    ]
};