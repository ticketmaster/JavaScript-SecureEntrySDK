const CleanWebPackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const configs = require('./webpack.common');

module.exports = configs.map(config => {
    return merge(config, {
        mode: 'production',
        devtool: 'source-map',
        plugins: [
            new CleanWebPackPlugin(['dist'])
        ]
    });
});
