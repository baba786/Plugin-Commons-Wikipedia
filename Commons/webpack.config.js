const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/code.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'code.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
