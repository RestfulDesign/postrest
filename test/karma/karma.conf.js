// Karma configuration
// Generated on Thu Jul 04 2013 11:39:34 GMT+0200 (CEST)

module.exports = function (karma) {

    var config = {

	// base path, that will be used to resolve files and exclude
	basePath: '../../',


	// frameworks to use
	//frameworks: ['jasmine', 'junit-reporter'],
	frameworks: ['mocha', 'chai'],

	// list of files / patterns to load in the browser
	files: [
	    'build/test.js',
	    'test/database.js'
	],


	// list of files to exclude
	exclude: [

	],

	// test results reporter to use
	reporters: ['spec'],

	// web server port
	port: 9876,

	// proxy to postrest
	//proxies: {
	//    '/':'http://0.0.0.0:6543'
	//},
	
	// cli runner port
	runnerPort: 9100,

	// enable / disable colors in the output (reporters and logs)
	colors: false,


	// level of logging
	// possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
	logLevel: karma.LOG_ERROR,


	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: false,

	client: {
	    mocha: { timeout: 12345 }
	},

	// Start these browsers, currently available:
	// - Chrome
	// - ChromeCanary
	// - Firefox
	// - Opera
	// - Safari (only Mac)
	// - PhantomJS
	// - IE (only Windows)
	browsers: [ "Chrome" ],
	customLaunchers: {
	    Chrome_travis: {
		base: 'Chrome',
		flags: ['--no-sandbox']
	    }
	},

	// If browser does not capture in given timeout [ms], kill it
	captureTimeout: 60000,

	// Continuous Integration mode
	// if true, it capture browsers, run tests and exit
	singleRun: true
    };

    // set travis specific browser configuration for Chrome
    if(config.browsers[0] === "Chrome" && process.env.TRAVIS){
	config.browsers = ["Chrome_travis"];
    }
    
    karma.set(config);

};
