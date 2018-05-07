const debug = process.env.NODE_ENV !== "production";
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin'),

  extractCSS = new ExtractTextPlugin({
    filename: "css/[name].css",
    allChunks: true
  });
const webpack = require('webpack');
const paths = require('./config/paths');

console.log("MODE: " + (debug ? "Development" : 'Production'));


module.exports = {
  mode: debug ? 'development' : 'production',
  context: __dirname,
  devtool: debug ? "inline-sourcemap" : false,
  entry:
    //dev: [require.resolve('webpack-dev-server/client') + '?/',
    //require.resolve('webpack/hot/dev-server')],
    /*
      Include an alternative client for WebpackDevServer. A client's job is to
      connect to WebpackDevServer by a socket and get notified about changes.
      When you save a file, the client will either apply hot updates (in case
      of CSS changes), or refresh the page (in case of JS changes). When you
      make a syntax error, this client will display a syntax error overlay.
      Note: instead of the default WebpackDevServer client, we use a custom one
      to bring better experience for Create React App users. You can replace
      the line below with these two lines if you prefer the stock client:
      require.resolve('webpack-dev-server/client') + '?/',
      require.resolve('webpack/hot/dev-server'),
      //require.resolve('react-dev-utils/webpackHotDevClient'),
      Finally, this is my app's code:
    */
    paths.appIndexJs,
  output: {
    path: __dirname + "/build",
    pathinfo: false,
    filename: "js/[name].bundle.js",
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'js/[name].chunk.js',
  },
  module: {
    rules: [{
      oneOf: [
        {
          test: /\.(js|jsx|mjs)$/,
          include: [paths.appSrc],
          use: [{
            loader: "babel-loader", // ES6 TO ES5 SYNTAX
            options: {
              cacheDirectory: true,
            },
          },]
        },

        {
          test: /\.(scss|css)$/,
          include: [paths.appSrc],
          use: debug ? [{
            loader: "style-loader" // creates style nodes from JS strings
          }, {
            loader: "css-loader", // Loads CSS
            options: {
              importLoaders: 2 // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
            }
          }, {
            loader: "postcss-loader"
          }, {
            loader: "sass-loader" // Compiles Sass to  CSS
          }] :
            extractCSS.extract(
              {
                fallback: "style-loader", // creates style nodes from JS strings
                use: [{
                  loader: "css-loader", // Loads CSS
                  options: {
                    importLoaders: 2 // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
                  }
                }, {
                  loader: "postcss-loader"
                }, {
                  loader: "sass-loader" // Compiles Sass to  CSS
                }]
              }
            )

        },

        {
          exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
          use: [{
            loader: "file-loader", // copies other files
            options: {
              name: '[name].[ext]'
            }
          }]
        }
      ]
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: paths.appHtml,
      files: {
        favicon: "/favicon.ico",
        manifest: "/manifest.json",
      }
    }),
    extractCSS,
  ],
  /* 
    Some libraries import Node modules but don't use them in the browser.
    Tell Webpack to provide empty mocks for them so importing them works. 
  */
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },

  devServer: {
    contentBase: paths.appPublic,
    watchContentBase: true,
    port: 9000,
    clientLogLevel: 'none',
    open: true
  },

  optimization: debug ? {} : {
    minimize: true,
    runtimeChunk: 'single',
    splitChunks: {
      chunks: "async",
      minSize: 1000,
      minChunks: 2,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    }
  }


};