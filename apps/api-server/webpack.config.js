const { join } = require('path');

const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  ignoreWarnings: [
    // Ignore sql-formatter source map warnings
    {
      module: /sql-formatter/,
      message: /Failed to parse source map/,
    },

    // Ignore pg-native optional dependency warning
    {
      module: /pg[\\/]lib[\\/]native/,
      message: /Can't resolve 'pg-native'/,
    },
    {
      module: /node_modules\/(bmp-ts|jimp)\//,
    },
    {
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/static'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMaps: true,
    }),
  ],
};
