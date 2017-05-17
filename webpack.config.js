const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs');
const gracefulFs = require('graceful-fs');

gracefulFs.gracefulify(fs);

const INJECTED_LIBS = [
  'babel-polyfill',
];
const ENTRY_PATHS = {
  courseHandler: path.resolve(__dirname, 'src/lambdas/course/courseHandler.js'),
  graphQLHandler: path.resolve(__dirname, 'src/lambdas/graph/graphQLHandler.js'),
  studentHandler: path.resolve(__dirname, 'src/lambdas/student/studentHandler.js'),
};

module.exports = {
  entry: Object.entries(ENTRY_PATHS).reduce((sum, [key, value]) => Object.assign({}, sum, {
    [key]: INJECTED_LIBS.concat(value),
  }), {}),
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: __dirname,
      exclude: /node_modules/,
    }],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
  },
};
