const merge = require('webpack-merge');
const configs = require('./webpack.common');
const WebpackAutoInject = require('webpack-auto-inject-version');

module.exports = configs.map(config => {
    return merge(config, {
        mode: 'development',
        devtool: 'inline-source-map',
        output: {
            filename: config.output.filename.replace(/(\.min\.js)$/, '.dev$1')
        },
        plugins: [
            new WebpackAutoInject({
                SHORT: 'Ticketmaster DEV',
                SILENT: true,
                componentsOptions: {
                    InjectAsComment: {
                        multiLineCommentType: true
                    }
                }
            })
        ]
    });
});
