// const path = require('path');
// const webpack = require('webpack');
import path from 'path';
import webpack from 'webpack'

export default {
  target: 'node',
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.standalone.js',
    clean: false,
  },
  // Bundle everything including node_modules - true standalone
  externals: {},
  plugins: [
    // Define environment variables at build time
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Ignore optional MongoDB dependencies that cause issues
    new webpack.IgnorePlugin({
      resourceRegExp: /^(kerberos|snappy|@mongodb-js\/zstd|mongodb-client-encryption|aws4|socks|gcp-metadata|@aws-sdk\/credential-providers)$/
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(your-custom-modules)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: '16'
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
    minimize: true, // Re-enable minification for security
    usedExports: true,
    sideEffects: false
  },
  devtool: false, // No source maps for security
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
