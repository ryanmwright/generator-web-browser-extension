const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const JsonPostProcessPlugin = require('json-post-process-webpack-plugin');
const extend = require('util')._extend;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const excludeFromCssModules = modulePath => {

  // TODO: Add any files here that you do not want to have CSS modules made for
  //return /(file_name_1|file_name_2)(\.css|\.scss)$/.test(modulePath);

  return false;
};

const updateManifestJson = (json, watch) => {
  let newJson = extend({}, json);
  if (watch) {
    if (!newJson.background.scripts) {
      newJson.background.scripts = [];
    }
    newJson.background.scripts.push('reloader.js');
    newJson.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'";
  }
  return newJson;
};

module.exports = (env, watch, uglify) => {
  const extensionPath = './src/';

  let result = {
    devtool: 'inline-source-map',
    watch: watch || false,
    entry: {
      content: extensionPath + 'content/main.ts',
      background: extensionPath + 'background/main.ts'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        // CSS that should SHOULD be turned into CSS modules
        {
          test: /(\.css|\.scss)$/,
          exclude: excludeFromCssModules,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [{
                  loader: 'typings-for-css-modules-loader?modules&namedExport&camelCase&localIdentName=[name]__[local]___[hash:base64:50]'
              }, {
                  loader: 'cssimportant-loader'
              }, {
                  loader: 'sass-loader'
              }]
          })
        },
        // CSS that should NOT be turned into CSS modules
        {
          test: modulePath => {
            return /(\.css|\.scss)$/.test(modulePath) && excludeFromCssModules(modulePath);
          },
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{
                loader: 'typings-for-css-modules-loader?modules&namedExport&camelCase'
            }, {
                loader: 'cssimportant-loader'
            }, {
                loader: 'sass-loader'
            }]
          })
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader',
            options: {
              attrs: [':data-src']
            }
          }
        }
      ]
    },
    plugins: [
      // Ignore any typing files that get generated
      new webpack.WatchIgnorePlugin([
        /css\.d\.ts$/
      ]),
      // Extract all CSS to this file
      new ExtractTextPlugin('content.css'),
      new CopyWebpackPlugin([{
        context: extensionPath,
        from: 'manifest.json',
        to: './'
      }, {
        context: extensionPath,
        from: './_locales/**/*',
        to: './'
      }, {
        context: extensionPath,
        from: './icons/**/*',
        to: './'
      }]),
      new JsonPostProcessPlugin({
        matchers: [{
          matcher: /manifest.json$/,
          action: json => updateManifestJson(json, watch)
        }]
      })
    ],
    output: {
      filename: './[name].js',
      path: path.resolve(__dirname, env.outputPath || 'dist')
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    }
  };

  if (watch) {
    result.entry.reloader = extensionPath + 'background/reloader.ts';
  }

  if (uglify) {
    result.plugins.push(new UglifyJSPlugin({
      sourceMap: true
    }));
  }

  if (env) {
    const configFilePath = path.resolve(__dirname, '../src/environments/environment.' + env + '.ts');

    if (fs.existsSync(configFilePath)) {
      result.plugins.push(new webpack.NormalModuleReplacementPlugin(/\.\/environments\/environment$/, configFilePath));
      result.resolve.alias = {
        environment: configFilePath
      };
    }
  }

  return result;
}