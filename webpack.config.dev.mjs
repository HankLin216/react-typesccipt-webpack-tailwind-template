import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base.mjs';
import Dotenv from 'dotenv-webpack';

const devWebpackConfig = merge(baseConfig, {
  mode: 'development',
  entry: {
    app: [
      'webpack-dev-server/client',
      'webpack/hot/dev-server',
      './src/index.tsx',
    ],
  },
  devtool: 'eval-source-map',
  devServer: {
    port: 8080,
    open: true,
    historyApiFallback: true,
  },
  plugins: [
    new Dotenv({
      path: './.env.development',
    }),
  ],
});

export default devWebpackConfig;
