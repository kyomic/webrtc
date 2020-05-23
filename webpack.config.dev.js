const polyfill = []
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const umd = {
  entry: polyfill.concat(['./src/index.js']),
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    libraryTarget: 'umd'
  },
  mode: 'production',
  module: {
    rules: [
      {
          test: require.resolve('jquery'), //require.resolve 用来获取模块的绝对路径
          use: [{
              loader: 'expose-loader',
              options: 'jQuery'
          }, {
              loader: 'expose-loader',
              options: '$'
          }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              minimize: true
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test:/\.less$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  },
  plugins: [
      new HtmlWebpackPlugin( { filename: "index.html", template: path.join(__dirname, "./src/index.html") } ),
      //new MiniCssExtractPlugin({ filename: 'style.css',})
  ],
  optimization: {
    minimize: true
  }
}

const client = {
  entry: polyfill.concat(['./src/index.js']),
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    library: 'Player',
    libraryTarget: 'window'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            minimize: false
          }
        },
        'postcss-loader',
        'sass-loader'
      ]
    },
      {
        test:/\.less$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin( { filename: "index.html", template: path.join(__dirname, "./src/index.html") } ),
    //new MiniCssExtractPlugin({filename: 'style.css',})
    
  ],
  devServer: {   
    port:8082,
    contentBase: false, // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true, // only errors & warns on hot reload
    // ...
  },
  optimization: {
    minimize: false
  }
}

module.exports = umd
