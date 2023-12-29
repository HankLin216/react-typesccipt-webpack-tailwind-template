import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base.mjs';

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
  plugins: [],
});

export default devWebpackConfig;
