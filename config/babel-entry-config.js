module.exports = {
  extensions: ['.js', '.ts', '.tsx'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { electron: require('electron/package.json').version },
        modules: 'commonjs',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    ["@babel/plugin-transform-typescript", {allowNamespaces: true}]
  ],
};
