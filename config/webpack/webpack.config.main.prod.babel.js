const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = merge.smart(baseConfig, {
  devtool: 'source-map',
  mode: 'production',
  entry: './src/main-process/main.ts',
  output: {
    path: path.join(__dirname, '../../'),
    filename: './dist/main.prod.js',
  },
  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
        new TerserPlugin({
          parallel: true,
          sourceMap: true,
          cache: true,
        }),
      ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
});
