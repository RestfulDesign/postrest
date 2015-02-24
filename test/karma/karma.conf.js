// Karma configuration

module.exports = function (karma) {

    var config = {

	// The root path location that will be used to resolve 
	// all relative paths defined in files and exclude.
	basePath: '../../',


	// List of test frameworks you want to use
	frameworks: ['mocha', 'chai'],
	
	// A map of preprocessors to use.
	preprocessors: {},
	
	// list of files / patterns to load in the browser
	files: [
	    'build/test.js',
	    'test/database.js'
	],


	// List of files/patterns to exclude from loaded files.
	exclude: [

	],

	// test results reporter to use
	reporters: ['spec'],

	// Hostname to be used when capturing browsers
	hostname: 'localhost',
	// web server port
	port: 9876,

	// A map of path-proxy pairs
	/*
	proxies: {
	    '/':'http://0.0.0.0:6543'
	},
	*/
	
	// cli runner port
	runnerPort: 9100,

	// enable / disable colors in the output (reporters and logs)
	colors: true,


	// level of logging
	// possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
	logLevel: karma.LOG_ERROR,
	
	//A list of log appenders to be used.
	loggers: [{type: 'console'}],

	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: false,

	// test runner client, i.e mocha
	client: {
	    mocha: { timeout: 12345 },
		useIframe: false,
		captureConsole: true
	},

	// List of plugins to load.
	plugins: ['karma-*'],
	
	// Run tests in these browsers, currently available:
	// - Chrome
	// - ChromeCanary
	// - Firefox
	// - Opera
	// - Safari (only Mac)
	// - PhantomJS
	// - IE (only Windows)
	browsers: [ "Chrome" ],
	
	// How long will Karma wait for a message from a browser 
	// before disconnecting from it (in ms).
	browserNoActivityTimeout: 10000,
	
	customLaunchers: {
	    Chrome_travis: {
		base: 'Chrome',
		flags: ['--no-sandbox']
	    }
	},

	// Maximum boot-up time allowed for a browser to start and connect to Karma.
	// If browser does not capture in given timeout [ms], kill it
	captureTimeout: 60000,

	// Continuous Integration mode
	// if true, it capture browsers, runs tests and exits
	singleRun: true
    };

    // set travis specific browser configuration for Chrome
    if(config.browsers[0] === "Chrome" && process.env.TRAVIS){
	config.browsers = ["Chrome_travis"];
    }
    
    karma.set(config);

};
