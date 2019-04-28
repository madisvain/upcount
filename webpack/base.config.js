'use strict';

const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, '../dist/main'),
    filename: '[name].js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  devtool: 'source-map',
};
