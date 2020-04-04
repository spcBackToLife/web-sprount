const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = merge.smart(baseConfig, {
  devtool: 'source-map',
  mode: 'production',
  target: 'electron-renderer',
  entry: {
    renderer: require.resolve('../../src/render-process/index.tsx'),
  },
  output: {
    path: path.join(__dirname, '..', '../dist'),
    publicPath: './dist/',
    filename: '[name].prod.js',
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
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
        }),
      ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
