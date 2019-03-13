const eslintrc = require('./spec/.eslintrc.json');

module.exports = function (config) {
    config.set({
        client: {
            captureConsole: false
        },

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            { pattern: 'spec/*.spec.js', watched: true },
            { pattern: 'src/*.js', watched: true }
        ],

        // list of files / patterns to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'spec/*.spec.js': ['webpack', 'eslint'],
            'src/*.js': ['webpack', 'eslint']
        },

        webpack: {
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
                        exclude: /spec|node_modules|vendor/,
                        loader: 'istanbul-instrumenter-loader'
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules|vendor|jsotp/,
                        loader: 'eslint-loader',
                        options: eslintrc
                    }
                ]
            }
        },

        webpackMiddleware: {
            stats: 'errors-only'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'progress',
            'mocha',
            'coverage'
        ],

        mochaReporter: {
            showDiff: true
        },

        coverageReporter: {
            reporters: [
                { type: 'text' }
            ]
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadless'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
