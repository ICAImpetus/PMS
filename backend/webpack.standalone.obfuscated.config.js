// const path = require('path');
// const webpack = require('webpack');
// const JavaScriptObfuscator = require('webpack-obfuscator');
import path from 'path';
import webpack from 'webpack';
import JavaScriptObfuscator from 'webpack-obfuscator'
export default  {
  target: 'node',
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.standalone.obf.js',
    clean: false,
  },
  externals: {},
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^(kerberos|snappy|@mongodb-js\/zstd|mongodb-client-encryption|aws4|socks|gcp-metadata|@aws-sdk\/credential-providers)$/
    }),
    // Obfuscate the final bundle aggressively
    new JavaScriptObfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.85,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 4000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'mangled-shuffled',
      numbersToExpressions: true,
      renameGlobals: true,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 7,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayCallsTransformThreshold: 0.75,
      stringArrayEncoding: ['rc4'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'variable',
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      target: 'node'
    }, ['server.standalone.obf.js.map'])
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
