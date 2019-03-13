const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');
const merge = require('webpack-merge');

const commonConfig = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'presence-secure-entry.min.js',
        library: 'Presence'
    },
    module: {
        rules: [
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.gif$/,
                loader: 'base64-image-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules|vendor/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules|vendor|jsotp/,
                loader: 'eslint-loader'
            }
        ]
    },
    plugins: [
        new WebpackAutoInject({
            SHORT: 'Ticketmaster',
            SILENT: true,
            componentsOptions: {
                InjectAsComment: {
                    multiLineCommentType: true
                }
            }
        }),
        new HtmlWebpackPlugin({
            hash: true,
            insert: 'head',
            template: './src/index.html'
        })
    ],
    devtool: 'source-map',
    devServer: {
        contentBase: './dist',
        port: 9000,
        open: true
    }
};

module.exports = [
    // Create bundles specific to each supported module system.
    ...['amd'].map(target => {
        return merge(commonConfig, {
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: `presence-secure-entry.${target}.min.js`,
                library: 'Presence',
                libraryTarget: target
            }
        });
    }),
    // Run default 'var' config last so it will be used if `npm run start:prod` is run.
    commonConfig
]
