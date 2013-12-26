// Karma configuration
module.exports = function(config) {

    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',
        // can either be a string (module name), which will be required by Karma, or an object (inlined plugin)
        plugins: [
            'karma-spec-reporter',
            'karma-furnace-preprocessor',
            'karma-ozjs',
            'karma-chai-sinon',
            'karma-chai-jquery',
            'karma-mocha',
            'karma-phantomjs-launcher',
            'karma-ios-launcher',
            'karma-safari-launcher',
            'karma-firefox-launcher',
            'karma-chrome-launcher'
        ],
        // frameworks to use
        frameworks: [
            'mocha',
            'chai-jquery',
            'chai-sinon',
            'ozjs',
        ],
        preprocessors: {
            'test/tpl/**/*.tpl': ['furnace[tpl>amd]']
        },
        // list of files / patterns to load in the browser
        files: [
            { pattern: 'js/**/*.js', included: false },
            { pattern: 'test/tpl/**/*.tpl', included: false },
            "target/css/main.css",
            "test/config.js",
            "test/tests.js",
        ],
        // list of files to exclude
        exclude: [
            
        ],
        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['spec'],
        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['PhantomJS'],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,
        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });

};
