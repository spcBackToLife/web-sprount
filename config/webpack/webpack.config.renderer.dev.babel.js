/*
 * @Author: pikun
 * @Date: 2019-12-04 19:48:33
 * @LastEditTime: 2019-12-08 16:43:50
 * @Description:
 */

const path = require('path');
const merge = require('webpack-merge');
const { spawn } = require('child_process');
const webpack = require('webpack');
const baseConfig = require('./webpack.config.base');

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
console.log('===>', path.join(__dirname, '../../src/sprout'))
module.exports = merge.smart(baseConfig, {
  devtool: 'inline-source-map',
  mode: 'development',
  target: 'electron-renderer',
  entry: {
    renderer: [
      require.resolve('../../src/sprout/windows/main-window/electron-render/index.tsx'),
      // 'react-hot-loader/patch',
      `webpack-dev-server/client?http://localhost:${port}/dist`,
      'webpack/hot/only-dev-server',
    ],
  },
  output: {
    publicPath: `http://localhost:${port}/dist`,
    filename: '[name].dev.js',
  },
  plugins: [
    new webpack.NamedModulesPlugin(), // 用于启动HMR时可以显示模块的相对路径
    new webpack.HotModuleReplacementPlugin(), // hot module replacement 启动模块热替换的插件
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],
  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(__dirname, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    before() {
      if (process.env.START_HOT) {
        console.log('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev-amd'], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        })
          .on('close', code => process.exit(code))
          .on('error', spawnError => console.error(spawnError));
      }
    },
  },
});
