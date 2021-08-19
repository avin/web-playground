const TerserPlugin = require('terser-webpack-plugin');
const postcssNormalize = require('postcss-normalize');
const path = require('path');
const getCSSModuleLocalIdent = require('./getCSSModuleLocalIdent');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

function generateWebpackConfig({
  src = '',
  filename,
  dstPath,
  publicPath,
  mode = 'development',
  useProductionSourceMap = false,
} = {}) {
  const isEnvDevelopment = mode === 'development';
  const isEnvProduction = mode === 'production';

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              require('postcss-flexbugs-fixes'),
              [
                require('postcss-preset-env'),
                {
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                },
              ],
              postcssNormalize(),
            ],
          },
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
      });
    }
    return loaders;
  };

  const config = {
    mode,
    entry: {
      app: src,
    },
    devtool: (() => {
      if (isEnvDevelopment) {
        return 'inline-cheap-source-map';
      }
      if (isEnvProduction) {
        return useProductionSourceMap ? 'source-map' : false;
      }
      return false;
    })(),
    output: {
      filename,
      path: dstPath,
      publicPath,
    },
    plugins: [],
    performance: false,
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(process.cwd(), `static`),
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: [/node_modules/],
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            compact: isEnvProduction,

            presets: [['@babel/preset-env'], ['@babel/preset-react'], ['@babel/preset-typescript']],
            plugins: [['@babel/transform-runtime'], ['@babel/plugin-proposal-class-properties']],
          },
        },
        {
          test: cssRegex,
          exclude: cssModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 3,
            },
            'sass-loader',
          ),
        },
        {
          test: cssModuleRegex,
          use: getStyleLoaders({
            importLoaders: 1,
            modules: {
              getLocalIdent: getCSSModuleLocalIdent,
            },
          }),
        },
        {
          test: sassRegex,
          exclude: sassModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 3,
            },
            'sass-loader',
          ),
          sideEffects: true,
        },
        {
          test: sassModuleRegex,
          use: getStyleLoaders(
            {
              importLoaders: 3,
              modules: {
                getLocalIdent: getCSSModuleLocalIdent,
              },
            },
            'sass-loader',
          ),
        },
        {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          loader: [require.resolve('raw-loader'), require.resolve('glslify-loader')],
        },
        {
          test: /\.(code)$/,
          exclude: /node_modules/,
          loader: [require.resolve('raw-loader')],
        },
      ],
    },

    optimization: {
      minimize: isEnvProduction,
      usedExports: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          parallel: false,
          cache: true,
          sourceMap: useProductionSourceMap,
          extractComments: false,
        }),
      ],
    },

    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
  };

  // console.log(JSON.stringify(config, null, 2));

  return config;
}

module.exports = generateWebpackConfig;
