
const path = require('path');
const webpack = require('webpack');

var webpackConfig = {
	mode: 'none',
	entry: './webpack-main.js', //'./main.js',
	output: {
		filename: 'mmir-lib.js',
		path: path.resolve(__dirname, 'dist'),
		library: "mmir",
		libraryTarget: "umd"

		// TEST usable library built
        //     (NOTE must impl. additional logic for loading workers, raw files
        //      etc. when including pre-built library
        //      maybe using WebpackManifestPlugin:
        //       collect info about workers, raw files etc. within loaders/plugins &
        //       then injecting the additional info via WebpackManifestPlugin.getCompilerHooks
        // chunkFormat: "commonjs",
        // chunkLoading: "require",
        // clean: true
	},
	devServer: {
		open: false,
		contentBase: './dist'
	},
    stats: {
        errorDetails: true
    }
};


//TEST mmir grammar options
var grammarOptions = {
	path: './test-data/config/languages',
	engine: 'pegjs',
	// asyncCompile: false,
	// async: true,
	initPhrase: 'turn the oven on',
	grammars: {
		ja: {ignore: true},
		de: {exclude: true},
		en: {engine: 'jscc', async: true},

		//specifying JSON grammar files directly
		testing: {engine: 'jscc', file: path.resolve('./test-data/config/languages/de/grammar.json'), force: true},
		testing2: {id: '!id warning!', engine: 'jison', file: path.resolve('./test-data/config/languages/de/grammar.json_large-example')}
		// testing_id_collision TODO : {engine: 'jison', file: path.resolve('./test-data/config/languages/de/grammar.json_large-example')}

	}
};
//TEST mmir view options
var viewOptions = {
	path: './test-data/views',
}
//TEST mmir (runtime) settings options:
var settingOptions = {
	path: path.resolve('./test-data/config'),
	// configuration: false,
	// speech: false,
	//TODO support "gobal" options for exclude, include:'file' (exepting grammars)
	grammar: {
		ja: {exclude: true}
	},
	// dictionary: true,
	speech: {
		de: {exclude: true},
		en: {include: 'file'}
	},
	dictionary: {
		ja: {include: 'file'}
	}
};
//TEST mmir state-chart/scxml options
var stateOptions = {
	path: './test-data/config/states_large',
	ignoreErrors: true,
	models: {
		input: {
			mode: 'simple',
			file: './test-data/config/states_minimal/inputDescriptionSCXML.xml'
		},
		dialog: {
			// ignoreErrors: true,
			mode: 'extended'
		}
	}
};
//TEST mmir controller options
var ctrlOptions = {
	path: './test-data/implementations_rm-bom/controllers',
	// addModuleExport: true,
	controllers: {
		application: {
			addModuleExport: true
		},
		calendar: {
			file: path.resolve('./test-data/implementations/controllers/calendar.js')
		},
		application2: false,
		application3: {exclude: true},
	}
}
//TEST mmir controller-helper options
var helperOptions = {
	path: './test-data/implementations_ORIG/helpers',
	addModuleExport: true,
	helpers: {
		calendarHelper: {exclude: false}
	}
}
//TEST mmir model options
var modelOptions = {
	path: './test-data/implementations_ORIG/models',
	// addModuleExport: true,
	models: {
		user: {addModuleExport: 'mmir.User'},
		calendarModel: {addModuleExport: 'mmir.CalendarModel'}
	}
}

//TEST mmir (runtime) app-configuratin
const mmirAppConfig = {
	// jquery: true,
	grammars: grammarOptions,
	views: viewOptions,
	settings: settingOptions,
	states: stateOptions,
	configuration: {
		language: 'en',
		// grammarAsyncExecMode: true,
		grammarAsyncExecMode: [{id: 'testing2', phrase: "erstelle einen Termin am 16.07.2018 um 15:30 Uhr"}],
		ignoreGrammarFiles: ['de', 'en', 'ignoreTest']
	},

	// includeModules: ['mmirf/asyncGrammar'],//FIXME should be automatically added if grammarAsyncExecMode and/or grammarOptions.asyncExec

	controllers: ctrlOptions,
	// controllers: {path: path.resolve('./test-data/empty')},
	helpers: helperOptions,
	models: modelOptions,

	loadBeforeInit: ['mmirf/polyfill'],

	// disableLogging: true,

	// //TEST parsing resource path & some custom settings:
	// resourcesPath: 'test-www',
	// resourcesPathOptions: {
	// 	addModuleExport: true,
	// 	// exclude: ['models', 'settings/grammar']
	// },
	// // models: false,
	// controllers: {
	// 	path: false,
	// 	controllers: {
	// 		application: {
	// 			addModuleExport: true
	// 		},
	// 		calendar: {
	// 			file: path.resolve('./test-data/implementations/controllers/calendar.js')
	// 		}
	// 	}
	// },
	//
	// includeModules: ['mmirf/jsccGen'],

// 	config: {
// 		'mmirf/inputManager': {
// 				modelUri: 'mmirf/state/input',//'states/input.xml'
// 				// simple | mode
// 				mode: 'extended',
// 				//EXAMPLE: set module-specific log-level to 'info'
// //		  logLevel: 'info'
// 		},
// 		'mmirf/dialogManager': {
// 				modelUri: 'mmirf/state/dialog',//'states/dialog.xml'
// 				// simple | mode
// 				mode: 'extended',
// 				//EXAMPLE: set module-specific log-level to 'verbose'
// //		  logLevel: 'verbose'
// 		}
// 	}
};

var modWebpackConfig = require('./index')(webpack, webpackConfig, mmirAppConfig);

// console.log('webpackConfig: ', webpackConfig)
// for(var n in webpackConfig.resolve.alias)

// console.log('mmirAppConfig: ', JSON.stringify(mmirAppConfig, null, 2))

//NOTE: require('./index')(...) returns modified webpackConfig, so actually
//      webpackConfig === modWebpackConfig
module.exports = modWebpackConfig;
