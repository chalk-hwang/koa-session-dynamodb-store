const path = require('path');
// eslint-disable-next-line import/no-unresolved
const slsw = require('serverless-webpack');
const webpack = require('webpack');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /node_modules[/\\]rc/i,
        use: {
          loader: require.resolve('shebang-loader'),
        },
      },
      {
        test: /\.(js|jsx)$/,
        include: __dirname,
        exclude: /node_modules\/(?!(koa-bodyparser|koa-logger)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: '8.10',
                  },
                },
              ],
              '@babel/preset-flow',
            ],
          },
        },
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.IgnorePlugin(/^hiredis$/),
  ],
};
