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
        // To avoid:
        // - [WARNING: Multiple instances of Three.js being imported.],
        // - [Field 'browser' doesn't contain a valid alias configuration
        //    /appserver/static/visualizations/3d_graph_network_topology_viz/node_modules/three/webgpu.js doesn't exist]
        alias: {
            // Ensure 'three/webgpu' is an exact match and points to the correct build file.
            // -> The '$' makes it an exact match for 'three/webgpu'.
            'three/webgpu$': path.resolve(__dirname, 'node_modules/three/build/three.webgpu.js'),
            // Ensure general 'three' imports also point to the module entry point.
            // This helps avoid conflicts if other dependencies import 'three' directly.
            'three$': path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
        }
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