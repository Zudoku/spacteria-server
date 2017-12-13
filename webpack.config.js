const path = require('path');

module.exports = {
  entry: './webapp/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'webapp')
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
};
