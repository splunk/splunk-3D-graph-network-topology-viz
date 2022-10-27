var webpack = require('webpack');
var path = require('path');

module.exports = {
    devtool: "eval-cheap-source-map",
    mode: "development",
    entry: {
        filename: path.join(__dirname, 'src') + '/visualization_source.js'
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