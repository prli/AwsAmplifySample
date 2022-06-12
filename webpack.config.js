var webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs'),
  env = require('./utils/env'),
  CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin,
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  WriteFilePlugin = require('write-file-webpack-plugin'),
  WebpackAutoInject = require('webpack-auto-inject-version');

const Dotenv = require('dotenv-webpack');
let packageJsonObject = require('./package.json');

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

var fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

var options = {
  mode: env.NODE_ENV,
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup', 'popup.js'),
    options: path.join(__dirname, 'src', 'js', 'utils', 'options.js'),
    background: path.join(
      __dirname,
      'src',
      'js',
      'background',
      'background.js'
    ),
    contentScript: path.join(
      __dirname,
      'src',
      'js',
      'content_script',
      'contentScript.js'
    ),
  },
  chromeExtensionBoilerplate: {
    notHotReload: ['contentScript'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [
          {
            test: path.resolve(__dirname, 'node_modules'),
            // Exclude all except...
            exclude: path.resolve(__dirname, 'node_modules/clipboard'),
          },
        ],
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: [
          {
            test: path.resolve(__dirname, 'node_modules'),
            // Exclude all except...
            exclude: [path.resolve(__dirname, 'node_modules/bootstrap-icons')],
          },
        ],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          interpolate: true,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            // inject CSS to page
            loader: 'style-loader',
          },
          {
            // translates CSS into CommonJS modules
            loader: 'css-loader',
          },
          {
            // Run postcss actions
            loader: 'postcss-loader',
          },
          {
            // compiles Sass to CSS
            loader: 'sass-loader',
          },
        ],
        exclude: [
          {
            test: path.resolve(__dirname, 'node_modules'),
            // Exclude all except...
            exclude: [
              path.resolve(__dirname, 'node_modules/bootstrap'),
              path.resolve(__dirname, 'node_modules/bootstrap-icons'),
            ],
          },
        ],
      },
    ],
  },
  resolve: {
    alias: alias,
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new Dotenv({
      path: path.join(__dirname, `.env.${env.NODE_ENV}`),
    }),
    new CopyWebpackPlugin(
      [
        {
          from: 'src/manifest.json',
          transform: function (content, path) {
            var manifestJsonObject = JSON.parse(content.toString());

            //keep package.json version same as manifest version
            //package.json require semantic version format, while manifest allows additional component
            manifestJsonObject['version'] = packageJsonObject['version'] + '.0';

            return Buffer.from(
              JSON.stringify({
                ...manifestJsonObject,
              })
            );
          },
        },
      ],
      { copyUnmodified: true }
    ),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background.html'),
      filename: 'background.html',
      chunks: ['background'],
    }),
    new WriteFilePlugin(),
    // auto inject version number, based on [AIV]{version}[/AIV]
    new WebpackAutoInject({
      components: {
        AutoIncreaseVersion: false,
      },
    }),
  ],
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
}

module.exports = options;
