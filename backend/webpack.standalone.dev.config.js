// const path = require("path");
import path from "path";

export default  {
  target: "node",
  mode: "development", // Development mode for better debugging
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.standalone.dev.js",
    clean: false,
  },
  // Bundle everything including node_modules
  externals: {},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(your-custom-modules)\/).*/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    node: "16",
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
    modules: ["node_modules"],
  },
  optimization: {
    minimize: false, // No minification for readable code
    usedExports: true,
    sideEffects: false,
  },
  devtool: "source-map", // Enable source maps for debugging
  stats: {
    colors: true,
    errorDetails: true,
    errors: true,
    warnings: true,
    modules: false,
    children: false,
    chunks: false,
    hash: false,
    version: false,
    timings: false,
    assets: false,
  },
  performance: {
    hints: false,
  },
};
