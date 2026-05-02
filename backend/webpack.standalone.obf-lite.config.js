// const path = require('path');
// const webpack = require('webpack');
// const JavaScriptObfuscator = require('webpack-obfuscator');
import path from 'path';
import webpack from 'webpack';
import JavaScriptObfuscator from 'webpack-obfuscator'

// "Lite" obfuscation profile: aims to reduce runtime CPU and startup cost
// while still providing some deterrence against casual reverse engineering.

export default  {
  target: 'node',
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.standalone.obf-lite.js',
    clean: false,
  },
  externals: {},
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^(kerberos|snappy|@mongodb-js\/zstd|mongodb-client-encryption|aws4|socks|gcp-metadata|@aws-sdk\/credential-providers)$/
    }),
    new JavaScriptObfuscator({
      compact: true,
      // Performance-friendly choices
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: true, // set to false if you want logs
      identifierNamesGenerator: 'hexadecimal',
      numbersToExpressions: false,
      renameGlobals: false,
      selfDefending: false,
      simplify: true,
      splitStrings: false,
      stringArray: true,
      stringArrayCallsTransform: false,
      stringArrayEncoding: false,
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: false,
      stringArrayWrappersParametersMaxCount: 2,
      stringArrayWrappersType: 'variable',
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
      target: 'node'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              '@babel/preset-env',
              { targets: { node: '16' } }
            ]]
          }
        }
      }
    ]
  },
  resolve: { extensions: ['.js'], modules: ['node_modules'] },
  optimization: { minimize: true, usedExports: true, sideEffects: false },
  devtool: false,
  stats: { colors: true, errors: true, warnings: true, modules: false, children: false, chunks: false },
  infrastructureLogging: { level: 'error' }
};
