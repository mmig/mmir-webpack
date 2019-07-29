
const path = require('path');
const _ = require('lodash');

var fileUtils = require('mmir-tooling/utils/filepath-utils');
var createBuildConfig = require('mmir-tooling/tools/create-build-config');

var appConfigUtils = require('./utils/webpack-module-init-gen.js');

var ReplaceModuleIdPlugin = require('./utils/webpack-plugin-replace-id.js');

var resourcesConfig = require('./webpack-resources-config');

var logUtils = require('mmir-tooling/utils/log-utils');
var log = logUtils.log;

var cliUtils = require('mmir-tooling/utils/cli-utils');

// log('mmir-lib: ', require('mmir-lib'))

var rootDir = path.dirname(require.resolve('mmir-lib'));
var webpackRootDir = __dirname;

// log('mmir-lib path: ', rootDir);
// log('mmir-webpack path: ', webpackRootDir);

var createResolveAlias = function(mmirAppConfig){

	var paths = resourcesConfig.paths;

	var alias = {}, p;
	for (var n in paths) {
		p = paths[n];
		if(/^build-tool\//.test(n)){
			alias[n] = path.isAbsolute(p)? p : path.join(webpackRootDir, p);
		} else {
			alias[n] = path.isAbsolute(p)? p : path.join(rootDir, p);
		}
	}

	appConfigUtils.addAliasFrom(mmirAppConfig, alias);

	if(mmirAppConfig.disableLogging){
		alias['mmirf/logger'] = alias['mmirf/loggerDisabled'];
	}

	return alias;
}

var enableJQuery = function(mmirAppConfig){
	mmirAppConfig.jquery = true;
	var paths = resourcesConfig.paths;
	paths['mmirf/util'] = 'tools/util_jquery';
}

var createModuleRules = function(mmirAppConfig){

	if(mmirAppConfig.jquery){
		enableJQuery(mmirAppConfig);
	}

	// var resourcesConfig = require('./webpack-resources-config');

	var buildConfig = createBuildConfig(mmirAppConfig, resourcesConfig);

	var appRootDir = mmirAppConfig.rootPath;

	var mmirAppConfigContent = appConfigUtils.generateModuleCode(mmirAppConfig);
	var appConfigModulePath = fileUtils.normalizePath(path.join(webpackRootDir, 'runtime', 'webpackModuleInit.js'));

	// log('###### creating module webpack-app-module-config.js with contents: '+ JSON.stringify(mmirAppConfigContent));

	var binFilePaths = resourcesConfig.fileResources.map(function(val){
		return fileUtils.normalizePath(path.isAbsolute(val)? val : path.join(rootDir, val));
	});

	//log('###### including as raw files: '+ binFilePaths);

	var textFilePaths = resourcesConfig.textResources.map(function(val){
		return fileUtils.normalizePath(path.isAbsolute(val)? val : path.join(rootDir, val));
	});

	// log('###### including as text files: '+ textFilePaths);

	var fileResourcesPathMap = resourcesConfig.resourcesPaths;

	var moduleRules = [

		// handle binary files (e.g. *.mp3):
		{
			test: fileUtils.createFileTestFunc(binFilePaths, ' for [raw file]'),
			use: {
				loader: 'file-loader',
				options: {
					name: function(file) {

						if(fileResourcesPathMap && fileResourcesPathMap[fileUtils.normalizePath(file)]){

							//if there is an explicit mapping entry, use the entry:
							log('  including [raw file] from plugin, remapping include-path "'+file+'" -> ', fileResourcesPathMap[fileUtils.normalizePath(file)]);
							file = fileResourcesPathMap[fileUtils.normalizePath(file)];

						} else if(file.indexOf(rootDir) === 0){

							//use relative path path (from mmir-lib root) in target/output directory for the resouce:
							log('  including [raw file], remapping include-path "'+file+'" -> ', file.substring(rootDir.length).replace(/^(\\|\/)/, ''));
							file = file.substring(rootDir.length).replace(/^(\\|\/)/, '');

						} else {
							//otherwise: include as bare file-name
							log('  including [raw file] remapping include-path "'+file+'" -> ', path.basename(file));
							file = path.basename(file);
						}

						//do normalize path-separators to '/' for proper usage in JS code -> "var url = require(<file resource>)"
						return fileUtils.normalizePath(file);
					}
				}
			}
		},

		// creates a module implementation for the app-config:
		{
			test: fileUtils.createFileTestFunc([appConfigModulePath], ' for [app config]'),
			use: {
				loader: 'val-loader',
				options: {
          appConfigCode: mmirAppConfigContent
        }
			}
		},

		// handle/include "raw" text files:
		{
			test: fileUtils.createFileTestFunc(textFilePaths, ' for [text files]'),
			use: {
				loader: 'raw-loader'
			}
		}

	];

	if(buildConfig.grammars.length > 0){
		// compile JSON grammars & include executables if necessary:
		moduleRules.push({
			test: fileUtils.createFileTestFunc(buildConfig.grammars.map(function(g){return g.file;}), ' for [grammar] files'),
			use: {
				loader: path.resolve(webpackRootDir, 'loader', 'grammar-loader.js'),
				options: {mapping: buildConfig.grammars, config: buildConfig.grammarOptions},
			},
			type: 'javascript/auto'
		});
	}


	if(buildConfig.views.length > 0){
		// compile view templates & include if necessary:
		moduleRules.push({
			test: fileUtils.createFileTestFunc(buildConfig.views.map(function(v){return v.file;}), ' for [view] files'),
			use: {
				loader: path.resolve(webpackRootDir, 'loader', 'view-loader.js'),
				options: {mapping: buildConfig.views, config: buildConfig.viewOptions},
			},
			type: 'javascript/auto'
		});
	}

	if(buildConfig.states.length > 0){
		// compile SCXML models & include if necessary:
		moduleRules.push({
			test: fileUtils.createFileTestFunc(buildConfig.states.map(function(s){return s.file;}), ' for [scxml] files'),
			use: {
				loader: path.resolve(webpackRootDir, 'loader', 'scxml-loader.js'),
				options: {mapping: buildConfig.states, config: buildConfig.stateOptions},
			},
			type: 'javascript/auto'
		});
	}
	//FIXME TODO: else include default/minimal state engines

	if(buildConfig.implList.length > 0){
		// load & pre-process implemetation files if necessary
		moduleRules.push({
			test: fileUtils.createFileTestFunc(buildConfig.implList.map(function(s){return s.file;}), ' for [controller | helper | model] files'),
			use: {
				loader: path.resolve(webpackRootDir, 'loader', 'impl-loader.js'),
				options: {mapping: buildConfig.implList},
			},
			type: 'javascript/auto'
		});
	}

	var settingsFiles = buildConfig.settings.filter(function(s){return s.include === 'file';});
	if(settingsFiles && settingsFiles.length > 0){

		if(!mmirAppConfig.webpackPlugins){
			mmirAppConfig.webpackPlugins = [];
		}

		mmirAppConfig.webpackPlugins.push(function(webpackInstance, alias){
			return new webpackInstance.NormalModuleReplacementPlugin(
				/mmirf\/settings\/(configuration|dictionary|grammar|speech)\//i,
				function(resource) {
					if(alias[resource.request]){

						// log('NormalModuleReplacementPlugin: redirecting resource: ', resource, ' -> ', alias[resource.request]);//DEBU

						// resource.request = alias[resource.request];//DISABLED hard-rewire request ... instead, add an alias resolver (see below)

						var ca = {};
						ca[resource.request] = alias[resource.request];
						resource.resolveOptions = {alias: ca};
					}
				}
		)});

		moduleRules.push({
			test: fileUtils.createFileTestFunc(buildConfig.settings.filter(function(s){return !_.isArray(s.file) && s.type !== 'grammar';}).map(function(s){return s.file;}), ' for [language resource] files'),
			use: {
				loader: 'file-loader',
				options: {
					name: function(file) {

						// var ofile = file;//DEBU

						var root = appRootDir;
						//use relative path (from root) in target/output directory for the resouce:
						if(file.indexOf(root) === 0){
							file = file.substring(root.length).replace(/^(\\|\/)/, '');
						}
						// log('including [from '+root+'] dictionary file ', ofile , ' -> ', file)//DEBU
						return file;
					}
				}
			},
			type: 'javascript/auto'
		});
	}

	return moduleRules;
}

var createPlugins = function(webpackInstance, alias, mmirAppConfig){

	// var CResolver = require('./webpack-plugin-custom-resolver.js');

	// var EncodingPlugin = require('webpack-encoding-plugin');

	var plugins = [

		// enable replacement implementation for requirejs' module.config()
		// NOTE: in difference to the requirejs implementation, this does need the module as first parameter, i.e. something like
		//      module.config(module) -> webpack_build_tool_module_config_helper_config(module)
		new webpackInstance.ProvidePlugin({
			'module.config': ['build-tool/module-config-helper', 'config'],
		}),

		// ignore modules that are specific for running mmir in node environment:
		new webpackInstance.IgnorePlugin(/^xmlhttprequest|worker_threads$/),

		// set custom module-IDs from alias-definitions for mmir-modules (enables mmir.require(<moduleId>))
		new ReplaceModuleIdPlugin(alias, rootDir, /\.((ehtml)|(js(on)?))$/i),

		// new CResolver(alias),//FIXME TEST

		// set environment variable WEBPACK_BUILD for enabling webpack-specific code
		new webpackInstance.DefinePlugin({
			'WEBPACK_BUILD': JSON.stringify(true),
		}),

		// redirect entry-point of mmir-lib to the webpack bootstrap/entry point
		new webpackInstance.NormalModuleReplacementPlugin(
			/requirejs-main\.js/,
			function(resource) {
				if(resource.rawRequest === 'mmir-lib'){//<- only redirect, if the file was requested via 'mmir-lib' (e.g. if requested directly via its path, do not redirect)
					// log('replacing module ', resource.request, ' -> ', path.join(webpackRootDir, 'webpack-main.js'))//, ', for ', resource);
					resource.request = path.join(webpackRootDir, 'webpack-main.js');
					resource.resource = resource.request;
				}
				// else {
				// 	log('ingnoring module replacement for ', resource.request);
				// }
			}
		),

		// // redirect 'mmirf/util/fileLoader'
		new webpackInstance.NormalModuleReplacementPlugin(
			/^mmirf\/util\/loadFile(__webpack_proxied)?$/,
			function(resource) {
				if(/__webpack_proxied$/.test(resource.request)){
					var modPath = path.resolve(alias['mmirf/util'], 'loadFile.js');
					// log('------------- replacing module ', resource.request, ' -> ', modPath);
					resource.request = modPath;
				} else {
					// log('############# replacing module ', resource.request, ' -> ', alias['mmirf/util/resourceLoader']);
					resource.request = alias['mmirf/util/resourceLoader'];
				}
			}
		),

		// FIXME somehow require-ing .ehtml resources (i.e. "mmirf/view/...") is not processed as module-request, so neither normal alias-resolving nor the replace-id plugin is triggered...
		//       ... hard-rewire the requires view-IDs to the
		new webpackInstance.NormalModuleReplacementPlugin(
			/mmirf\/(view|controller|grammar|helper|model|scxml)\//i,
			function(resource) {
				if(alias[resource.request]){

					// log('NormalModuleReplacementPlugin: redirecting resource: ', resource, ' -> ', alias[resource.request]);

					var ca = {};
					ca[resource.request] = alias[resource.request];
					resource.resolveOptions = {alias: ca};
				}
			}
		),

		// //TEST try to limit/tell webpack the restrictions of require() calls in order to avoid compilation warnings
		// new webpack.ContextReplacementPlugin(/^mmirf\/()/, (context) => {
		//   if ( !/\/moment\//.test(context.context) ) return;
		//
		//   Object.assign(context, {
		//     regExp: /^\.\/\w+/,
		//     request: '../../locale' // resolved relatively
		//   });
		// })

		// new EncodingPlugin({
    //   encoding: 'utf16le'
    // }),

	];

	if(mmirAppConfig.webpackPlugins){
		mmirAppConfig.webpackPlugins.forEach(function(p){
			plugins.push(typeof p === 'function'? p(webpackInstance, alias, mmirAppConfig) : p);
		})
	}

	return plugins;
};

/**
 * HELPER check existing module-rules and exclude mmir-files if necessary
 *
 * @param {Array<webpack/Rule>} moduleRules the module.rules list of the webpack configuration
 */
var modifyModuleRuleFilters = function(moduleRules){

	if(!moduleRules || moduleRules.length === 0){
		return;
	}

	var rawFilePaths = resourcesConfig.fileResources.map(function(val){
		return fileUtils.normalizePath(path.isAbsolute(val)? val : path.join(rootDir, val));
	});

	moduleRules.forEach(function(rule){

		// console.log('checking module.rule ', rule)

		var test = rule.test || (rule.resource? rule.resource.test : null);
		if(test){
			var isMatch = false, file;
			for(var i=0, size = rawFilePaths.length; !isMatch && i < size; ++i){
				file = rawFilePaths[i];
				// console.log('checkin module.rule (test type: '+(typeof test)+') for file ', file);
				isMatch = testFileForModuleRuleCondition(file, test);
			}
			if(isMatch){
				// console.log('WARN module.rule does match mmir-file -> ', rule)
				excludeFilesFromModuleRule(rawFilePaths, rule);
			}
		}
	});

};

/**
 * HELPER test if file matches the module.rule test-condition(s)
 *
 * @param  {string} file the file(-path) to test
 * @param  {webpack/Condition} test the module.rule's condition(s)
 * @return {boolean} the test result
 */
var testFileForModuleRuleCondition = function(file, test){
	var isMatch = false;
	switch(typeof test){
		case 'string':
			isMatch = test === file;
			// console.log('  checked string module.rule.test for match: ', isMatch)
			break;
		case 'function':
			isMatch = test(file);
			// console.log('  checked function module.rule.test for match: ', isMatch)
			break;
		case 'object':
			// console.log('  checking ojbect module.rule.test ...');
			if(test instanceof RegExp){
				test.lastIndex = 0;
				isMatch = test.test(file);
				test.lastIndex = 0;
				// console.log('  checked RegExp module.rule.test for match: ', isMatch)
				break;
			} else if(Array.isArray(test)){
				for(var i=0, size = test.length; i < size; ++i){
					isMatch = testFileForModuleRuleCondition(file, test[i]);
					if(isMatch){
						break;
					}
				}
				break;
			}
			//FIXME add support for testing condition-object!!!
		default:
			log('WARN cannot test module.rule ', rule);
	}
	return isMatch;
};

/**
 * HELPER add exclude-condition to module.rule for a list of (mmir) files
 *
 * @param  {Array<string>} fileList the file-list which should be added to the exclude condition
 * @param  {webpack/Rule} moduleRule the module rule
 */
var excludeFilesFromModuleRule = function(fileList, moduleRule){
	var exclude = moduleRule.exclude || (moduleRule.resource? moduleRule.resource.exclude : null);
	var exclFunc = fileUtils.createFileTestFunc(fileList, ' for excluding [raw file] from module.rule');
	if(exclude){
		if(Array.isArray(exclude)){
			exclude.push(exclFunc);
		} else {
			exclude = [exclude, exclFunc];
			if(moduleRule.exclude){
				moduleRule.exclude = exclude;
			} else {
				moduleRule.resource.exclude = exclude;
			}
		}
	} else {
		moduleRule.exclude = exclFunc;
	}
};

/**
 * apply webpack configuration for mmir-lib to an existing webpack configuration
 *
 * @param  {[type]} webpackInstance the webpack instance, e.g. retrieve via require('webpack')
 * @param  {[type]} webpackConfig the existing webpack configuration
 * @param  {[type]} mmirAppConfig app-specific configuration for mmir-lib
 */
function apply(webpackInstance, webpackConfig, mmirAppConfig){

	// log('############################## webpack-version: ', JSON.stringify(webpackInstance.version))
	// log('############################## webpack instance: ', webpackInstance)

	cliUtils.parseCli();

	var useRulesForLoaders = webpackInstance.version && parseFloat(webpackInstance.version) >= 4? true : false;

	if(typeof mmirAppConfig === 'string'){
		mmirAppConfig = JSON.parse(mmirAppConfig);
	} else if(!mmirAppConfig){
		mmirAppConfig = {};
	}

	//add loader configurations:
	// (NOTE must do this before creating alias definition as some loaders may add alias mappings to mmirAppConfig)
	var moduleRules = createModuleRules(mmirAppConfig);
	if(!useRulesForLoaders){
		moduleRules.forEach(function(rule){
			if(rule.type){
				if(rule.use && rule.use.options){
					rule.use.options.isRuleTypeDisabled = true;
				}
				delete rule.type;
			}
		});
	}
	if(!webpackConfig.module){
		webpackConfig.module = {};
	}
	var targetList = webpackConfig.module.rules || (useRulesForLoaders? null : webpackConfig.module.loaders);
	if(!targetList){
		targetList = [];
		webpackConfig.module[useRulesForLoaders? 'rules': 'loaders'] = targetList;
	}
	//check & add exclude-filters (for mmir files/resources) to existing module-rules if necessary:
	modifyModuleRuleFilters(targetList);
	for(var i = 0, size = moduleRules.length; i < size; ++i){
		targetList.push(moduleRules[i]);
	}

	//add alias resolving:
	var alias = createResolveAlias(mmirAppConfig);
	if(!webpackConfig.resolve){
		webpackConfig.resolve = {alias: alias};
	} else {
		if(webpackConfig.resolve.alias){
			Object.assign(webpackConfig.resolve.alias, alias);
		} else {
			webpackConfig.resolve.alias = alias;
		}
	}

	// console.log('webpackConfig.resolve.alias: ', JSON.stringify(webpackConfig.resolve.alias));


	//add plugins
	var plugins = createPlugins(webpackInstance, alias, mmirAppConfig);
	if(!webpackConfig.plugins){
		webpackConfig.plugins = plugins;
	} else {
		for(var i = 0, size = plugins.length; i < size; ++i){
			webpackConfig.plugins.push(plugins[i]);
		}
	}

	//add webworker loader configuration
	require('./utils/webpack-worker-loader-utils').apply(webpackConfig, rootDir, useRulesForLoaders);
}

module.exports = apply;
