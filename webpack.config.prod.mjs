import { merge } from 'webpack-merge'
import baseConfig from './webpack.config.base.mjs'

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
});

export default prodWebpackConfig
