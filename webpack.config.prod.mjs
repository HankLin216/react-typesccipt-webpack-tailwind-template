import { merge } from 'webpack-merge'
import baseConfig from './webpack.config.base.mjs'
import Dotenv from 'dotenv-webpack';

const prodWebpackConfig = merge(baseConfig, {
  mode: 'production',
  entry: {
    app: ['./src/index.tsx'],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new Dotenv({
      path: './.env',
    }),
  ],
});

export default prodWebpackConfig
