const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.extension.config.js');

module.exports = (env, watch) => {
  return merge(baseConfig(env, watch), {
    resolve: {
      extensions: [ '.ts' ],
      alias: {
          environment: path.resolve(__dirname, 'src/environments/environment.test.ts')
      }
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/\.\/environments\/environment$/, path.resolve(__dirname, 'src/environments/environment.test.ts'))
    ]
  });
}