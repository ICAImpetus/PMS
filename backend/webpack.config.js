const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // Important: tells webpack this is for Node.js
  mode: process.env.NODE_ENV || 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.bundle.js',
    clean: true, // Clean the output directory before emit
  },
  externals: [nodeExternals()], // Exclude node_modules from bundle
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: '16' // Target Node.js 16+
                }
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules']
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production'
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  stats: {
    colors: true,
    errorDetails: true,
    errors: true,
    warnings: true,
    modules: false,
    children: false,
    chunks: false,
    timings: true,
    builtAt: true
  },
  infrastructureLogging: {
    level: 'error'
  }
};
