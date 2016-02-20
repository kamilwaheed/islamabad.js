const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  dev: {
    watch: true,
    module: {
      loaders: [
        { test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: { presets: ['es2015'] } }
      ]
    },
    output: {
      filename: '[name]-[hash].js'
    },
    plugins: [
      new CleanWebpackPlugin(['static/js/dist'], {
        root: __dirname,
        verbose: true
      }),
      new webpack.optimize.UglifyJsPlugin()
    ]
  },

  prod: {
    watch: false,
    module: {
      loaders: [
        { test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: { presets: ['es2015'] } }
      ]
    },
    output: {
      filename: '[name]-[hash].js'
    },
    plugins: [
      new CleanWebpackPlugin(['static/js/dist'], {
        root: __dirname,
        verbose: true
      }),
      new webpack.optimize.UglifyJsPlugin()
    ]
  }
};
