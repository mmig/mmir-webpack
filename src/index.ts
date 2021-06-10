
import { dirname, join, basename, isAbsolute, resolve } from 'path';
import { isArray } from 'lodash';

import type { WebpackAppConfig , WebpackModule , WebpackModuleConfiguration, WebpackRule } from './index.d';
import type { BuildConfig } from 'mmir-tooling';

import fileUtils from  'mmir-tooling/utils/filepath-utils';
import packageUtils from './utils/package-utils';
import { createBuildConfig } from 'mmir-tooling/tools/create-build-config';
import grammarUtils from 'mmir-tooling/grammar/grammar-utils';

import appConfigUtils from './utils/webpack-module-init-gen.js';
import workerLoaderUtils from './utils/webpack-worker-loader-utils';

import { ReplaceModuleIdPlugin } from './utils/webpack-plugin-replace-id.js';

import resourcesConfig from './webpack-resources-config';
import cliUtils from 'mmir-tooling/utils/cli-utils';

import { createResolveAlias , getAliasEntry , setAliasEntry , isExactAliasEntry } from './utils/webpack-resolve-utils';

import logUtils from 'mmir-tooling/utils/log-utils';

const log = logUtils.log;
const warn = logUtils.warn;

type TestFileCondOption = string | ((file: string)=>boolean) | RegExp;
type ModuleRule = any;//FIXME webpack module-rule
type Plugin = any;//FIXME webpack plugin ({ apply: (arg0: Resolver) => void } | ((this: Resolver, arg1: Resolver) => void))

// log('mmir-lib: ', require('mmir-lib'))

/** root directory of the mmir-lib package */
const rootDir = dirname(require.resolve('mmir-lib'));
/** root directory of the mmir-webpack package (i.e. this package) */
const webpackRootDir = __dirname;

// log('mmir-lib path: ', rootDir);
// log('mmir-webpack path: ', webpackRootDir);

function enableJQuery(mmirAppConfig: WebpackAppConfig): void {
    mmirAppConfig.jquery = true;
    var paths = resourcesConfig.paths;
    paths['mmirf/util'] = 'tools/util_jquery';
}

function createModuleRules(mmirAppConfig: WebpackAppConfig, buildConfig: BuildConfig){

    var appRootDir = mmirAppConfig.rootPath;

    //FIXME currently cannot include grammar.json as file because of json-grammar-loader TODO include same resouce multiple times with different formats(?) multi-loader?
    buildConfig.settings.forEach(function(s){
        if(!s.exclude){
            if(isArray(s.file) && s.include !== 'inline'){
                warn('WARN settings-utils: encountered multiple file resources for "'+s.id+'" ('+s.type+'): cannot be included as (single) file, inlining  resources instead...');
                s.include = 'inline';
            } else if(s.type === 'grammar' && s.include !== 'inline'){
                warn('WARN: cannot include JSON grammars as file, inlining grammar source for "'+s.id+'" instead ...');
                s.include = 'inline';
            } else if(s.type === 'speech' && s.value && s.include !== 'inline'){
                warn('WARN cannot include speech-config with modified value as JSON file, inlining speech-config for "'+s.id+'" instead ..."');
                s.include = 'inline';
            }
        }
    });

    var mmirAppConfigContent = appConfigUtils.generateModuleCode(mmirAppConfig);
    var appConfigModulePath = fileUtils.normalizePath(join(webpackRootDir, 'runtime', 'webpackModuleInit.js'));

    // log('###### creating module webpack-app-module-config.js with contents: '+ JSON.stringify(mmirAppConfigContent));

    var binFilePaths = resourcesConfig.fileResources.map(function(val){
        return fileUtils.normalizePath(isAbsolute(val)? val : join(rootDir, val));
    });

    //log('###### including as raw files: '+ binFilePaths);

    var textFilePaths = resourcesConfig.textResources.map(function(val){
        return fileUtils.normalizePath(isAbsolute(val)? val : join(rootDir, val));
    });

    // log('###### including as text files: '+ textFilePaths);

    var fileResourcesPathMap = resourcesConfig.resourcesPaths;

    var moduleRules: ModuleRule[] = [

        // handle binary files (e.g. *.mp3):
        {
            test: fileUtils.createFileTestFunc(binFilePaths, ' for [raw file]'),
            use: {
                loader: 'file-loader',
                options: packageUtils.setOptionIf({
                    name: function(file: string): string {

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
                            log('  including [raw file] remapping include-path "'+file+'" -> ', basename(file));
                            file = basename(file);
                        }

                        //do normalize path-separators to '/' for proper usage in JS code -> "var url = require(<file resource>)"
                        return fileUtils.normalizePath(file);
                    }
                },
                //set compatiblity option: if file-loader >= 5.0.0 set 'esModule' to false, otherwise set 'esModules' to false
                'esModule', 'esModules', false, false, 'file-loader', '>= 5.0.0')
            }
        },

        // creates a module implementation for the app-config:
        {
            test: fileUtils.createFileTestFunc([appConfigModulePath], ' for [app config]'),
            use: {
                loader: 'val-loader',
                options: {
                    appConfigCode: mmirAppConfigContent
                    //TODO add: dependencies: [...] -> resolve file-paths via alias for:
                    // 				mmirAppConfig.includeModules
                    // 				mmirAppConfig.loadAfterInit
                    // 				mmirAppConfig.loadBeforeInit
                    // 				mmirAppConfig.runtimeSettings
                    // 					-> 1. need to check if configuration.json (or other JSON-configs) & via mmir-build.config.js and add those as file-dependencies
                    // 					   2. need check all entries "mmirf/settings/[dictionary|grammar|speech]"
                    // 					   3. evaluate directories.json?
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
                loader: resolve(webpackRootDir, 'loader', 'grammar-loader.js'),
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
                loader: resolve(webpackRootDir, 'loader', 'view-loader.js'),
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
                loader: resolve(webpackRootDir, 'loader', 'scxml-loader.js'),
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
                loader: resolve(webpackRootDir, 'loader', 'impl-loader.js'),
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

        mmirAppConfig.webpackPlugins.push(function(webpackInstance: WebpackModule, alias: {[id: string]: string}){
            return new webpackInstance.NormalModuleReplacementPlugin(
                /mmirf\/settings\/(configuration|dictionary|grammar|speech)\//i,
                function(resource) {
                    const aliasEntry = getAliasEntry(resource.request, alias);
                    if(aliasEntry){

                        // log('NormalModuleReplacementPlugin: redirecting resource: ', resource, ' -> ', aliasEntry);//DEBU

                        // resource.request = aliasEntry;//DISABLED hard-rewire request ... instead, add an alias resolver (see below)

                        const ca = {};
                        const isExact = isExactAliasEntry(resource.request, alias);
                        setAliasEntry(resource.request, aliasEntry, ca, isExact);
                        resource.resolveOptions = {alias: ca};
                    }
                }
        )});

        moduleRules.push({
            test: fileUtils.createFileTestFunc(buildConfig.settings.filter(function(s){return !isArray(s.file) && s.type !== 'grammar';}).map(function(s){return s.file;}), ' for [language resource] files'),
            use: {
                loader: 'file-loader',
                options: {
                    name: function(file: string): string {

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

function createPlugins(webpackInstance: WebpackModule, alias: {[id: string]: string}, mmirAppConfig: WebpackAppConfig, buildConfig: BuildConfig): Plugin[] {

    // var EncodingPlugin = require('webpack-encoding-plugin');

    // console.log('buildConfig', buildConfig)

    var plugins: Plugin[] = [

        // enable replacement implementation for requirejs' module.config()
        // NOTE: in difference to the requirejs implementation, this does need the module as first parameter, i.e. something like
        //      module.config(module) -> webpack_build_tool_module_config_helper_config(module)
        new webpackInstance.ProvidePlugin({
            'module.config': ['build-tool/module-config-helper', 'config'],
        }),

        // ignore modules that are specific for running mmir in node environment:
        new webpackInstance.IgnorePlugin({resourceRegExp: /^(?:xmlhttprequest|worker_threads|webworker-threads)$/}),

        // // FIXM ignore internal node modules that are often require'd in disabled node-detection code (-> emscripten etc):
        // new webpackInstance.IgnorePlugin({resourceRegExp: /^crypto|fs|path$/}),

        // set custom module-IDs from alias-definitions for mmir-modules (enables mmir.require(<moduleId>))
        new ReplaceModuleIdPlugin(alias, rootDir, /\.((ehtml)|(js(on)?))$/i),

        // set environment variable WEBPACK_BUILD for enabling webpack-specific code
        new webpackInstance.DefinePlugin({
            'WEBPACK_BUILD': JSON.stringify(true),
        }),

        // redirect entry-point of mmir-lib to the webpack bootstrap/entry point
        new webpackInstance.NormalModuleReplacementPlugin(
            /requirejs-main\.js/,
            function(resource) {
                if(resource.rawRequest === 'mmir-lib' || /*FIX HACK webpack v5: no field rawRequest -> use field request, TODO proper migration */ resource.request === 'mmir-lib'){//<- only redirect, if the file was requested via 'mmir-lib' (e.g. if requested directly via its path, do not redirect)
                    // log('replacing module ', resource.request, ' -> ', join(webpackRootDir, 'webpack-main.js'))//, ', for ', resource);
                    resource.request = join(webpackRootDir, 'webpack-main.js');
                    // FIX webpack4: need to set resource.resource field:
                    resource.resource = resource.request;
                    // FIX webpack v5: need to set resource in field createData
                    //     see implementation details for NormalModuleReplacementPlugin
                    //     https://github.com/webpack/webpack/blob/ff1b314d30fbf996dc0acf37b7b789eab8ca33e1/lib/NormalModuleReplacementPlugin.js#L45
                    if(resource.createData){
                        resource.createData.resource = resource.request;
                    }
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
                    var modPath = resolve(getAliasEntry('mmirf/util', alias), 'loadFile.js');
                    // log('------------- replacing module ', resource.request, ' -> ', modPath);
                    resource.request = modPath;
                } else {
                    // log('############# replacing module ', resource.request, ' -> ', getAliasEntry('mmirf/util/resourceLoader', alias));
                    resource.request = getAliasEntry('mmirf/util/resourceLoader', alias);
                }
                // FIX webpack v5: need to set resource in field createData
                if(resource.createData){
                    resource.createData.resource = resource.request;
                }
            }
        ),

        // FIXME somehow require-ing .ehtml resources (i.e. "mmirf/view/...") is not processed as module-request, so neither normal alias-resolving nor the replace-id plugin is triggered...
        //       ... hard-rewire the requires view-IDs to the
        new webpackInstance.NormalModuleReplacementPlugin(
            /mmirf\/(view|controller|grammar|helper|model|scxml)\//i,
            function(resource) {
                const aliasEntry = getAliasEntry(resource.request, alias);
                if(aliasEntry){

                    // log('NormalModuleReplacementPlugin: redirecting resource: ', resource, ' -> ', aliasEntry);

                    const ca = {};
                    const isExact = isExactAliasEntry(resource.request, alias);
                    setAliasEntry(resource.request, aliasEntry, ca, isExact);
                    resource.resolveOptions = {alias: ca};
                    // console.log('NormalModuleReplacementPlugin: redirecting resource: -> ', resource.resolveOptions);
                }
            }
        ),

        // //TEST try to limit/tell webpack the restrictions of require() calls in order to avoid compilation warnings
        // // TODO enable: limit includes for mmir-lib/lib/env/media/*.js: either by require('./'+<var>) or require('../env/media/'+<var>) or (internal) require('.')
        // new webpackInstance.ContextReplacementPlugin(/^\.\.?\/?(env\/media)?$/, (context) => {
        //   // if ( !/[\\/]mmir-lib[\\/]lib[\\/](env[\\/]media|manager)$/.test(context.context) ) return;
        // 	var envMedia = resolve(rootDir, 'env', 'media');
        // 	if(resolve(context.context, context.request) !== envMedia) return;
        //
        // 	console.log('------------------------------ mmir-lib/env/media/* -> ', context);//, alias)
        //
        // 	//TODO create list of required media modules & RegExp outside closure
        // 	var includeMediaModules = ['audiotts', 'webAudio', 'ttsMary', 'webspeechAudioInput', 'webMicLevels'];
        // 	var re = new RegExp('^\\./('+ includeMediaModules.join('|') +')(\.js)?$');
        //
        //   Object.assign(context, {
        // 		context: envMedia,	//<- normalize: set context to env/media directory
        //      regExp: re, ///^\.\/(audiotts|webAudio|ttsMary|webspeechAudioInput|webMicLevels)$/,//<- regExp for included modules of env/media
        // 		request: '.' //<- trigger evaluation of files-names via regExp in env/media
        //   });
        // }),

        // new EncodingPlugin({
        //   encoding: 'utf16le'
        // }),

    ];

    //configure dependencies within WebWorker in case async-execution for grammar is enable for at least 1 grammar:
    // create resource/ID mapping for including async-exec grammars in WebWorker script
    if(buildConfig.grammars && buildConfig.grammars.length > 0){

        var execAsyncGrammarIdMap = {};
        var isAsyncExec = false;
        buildConfig.grammars.forEach(function(g){
            if(g.async){
                isAsyncExec = true;
                execAsyncGrammarIdMap['./'+g.id] = grammarUtils.toAliasId(g);
            }
        });

        //only create mapping function & plugin instance etc, if at least 1 async-exec grammar is present:
        if(isAsyncExec){

            var ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
            var createAsyncGrammarContextMap = (_fs: any, callback: any) => {
                // console.log('###################### ContextReplacementPlugin.newContentCreateContextMap() -> ', callback)
                callback(null, execAsyncGrammarIdMap);
            };

            plugins.push(
                //TODO for async-grammar-exec: do include all referenced compiled grammars in its web-worker script
                new webpackInstance.ContextReplacementPlugin(
                    /^.\/\<mmir-async-grammar-exec\>/, //<- placeholder URI in mmir-lib's asyncGrammarWorker for loading/including async-exec grammars in WebWorker script

                    function(context){

                        //NOTE adapted from ContextReplacementPlugin's handling of map-option
                        context.resolveDependencies = (fs, options, callback) => {
                            createAsyncGrammarContextMap(fs, (err, map) => {
                                if (err) return callback(err);
                                const dependencies = Object.keys(map).map(key => {
                                    return new ContextElementDependency(
                                        map[key] + options.resourceQuery,
                                        key
                                    );
                                });
                                callback(null, dependencies);
                            });
                        };

                        Object.assign(context, {
                            //NOTE need any directory in order to trigger parsing of directory which in turn allows to attach multiple ContextElementDependency
                            request: __dirname
                      });
                    }
                )//END: new ...
            );//END: plugins.push(...
        }//END: if(isAsyncExec)
    }//END: if(createAsyncGrammarContextMap)

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
 * @param {Array<webpack/Rule>} moduleRules the module.rules list of the webpack configuration (INOUT parameter)
 * @returns {Array<webpack/Rule>} the (possibly) modified rules
 */
function modifyModuleRuleFilters(moduleRules: Array<WebpackRule>): Array<WebpackRule> {

    if(!moduleRules || moduleRules.length === 0){
        return;
    }

    var rawFilePaths = resourcesConfig.fileResources.map(function(val){
        return fileUtils.normalizePath(isAbsolute(val)? val : join(rootDir, val));
    });

    moduleRules.forEach(function(rule){

        // console.log('checking module.rule ', rule)

        var test = rule.test || (rule.resource? (rule.resource as any).test : null);
        if(test){
            var isMatch: boolean = false, file: string;
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

    return moduleRules;
};

/**
 * HELPER test if file matches the module.rule test-condition(s)
 *
 * @param  {string} file the file(-path) to test
 * @param  {webpack/Condition} test the module.rule's condition(s)
 * @return {boolean} the test result
 */
function testFileForModuleRuleCondition(file: string, test: TestFileCondOption | TestFileCondOption[]): boolean {
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
            log('WARN cannot test module.rule ', file);
    }
    return isMatch;
};

/**
 * HELPER add exclude-condition to module.rule for a list of (mmir) files
 *
 * @param  {Array<string>} fileList the file-list which should be added to the exclude condition
 * @param  {webpack/Rule} moduleRule the module rule
 */
function excludeFilesFromModuleRule(fileList: string[], moduleRule: WebpackRule): void {
    var exclude = moduleRule.exclude || (moduleRule.resource? (moduleRule.resource as any).exclude : null);
    var exclFunc = fileUtils.createFileTestFunc(fileList, ' for excluding [raw file] from module.rule');
    if(exclude){
        if(Array.isArray(exclude)){
            exclude.push(exclFunc);
        } else {
            exclude = [exclude, exclFunc];
            if(moduleRule.exclude){
                moduleRule.exclude = exclude;
            } else {
                (moduleRule.resource as any).exclude = exclude;
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
function apply(webpackInstance: WebpackModule, webpackConfig: WebpackModuleConfiguration, mmirAppConfig: WebpackAppConfig): WebpackModuleConfiguration {

    // log('############################## webpack-version: ', JSON.stringify(webpackInstance.version))
    // log('############################## webpack instance: ', webpackInstance)

    cliUtils.parseCli();

    var useRulesForLoaders = webpackInstance.version && parseFloat(webpackInstance.version) >= 4? true : false;

    if(typeof mmirAppConfig === 'string'){
        mmirAppConfig = JSON.parse(mmirAppConfig);
    } else if(!mmirAppConfig){
        mmirAppConfig = {};
    }

    if(mmirAppConfig.jquery){
        enableJQuery(mmirAppConfig);
    }

    // var resourcesConfig = require('./webpack-resources-config');

    var buildConfig = createBuildConfig(mmirAppConfig, resourcesConfig);
    if(typeof buildConfig === 'string'){
        throw new Error(buildConfig);
    }

    //add loader configurations:
    // (NOTE must do this before creating alias definition as some loaders may add alias mappings to mmirAppConfig)
    var moduleRules = createModuleRules(mmirAppConfig, buildConfig);
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
    //NOTE: compatiblity code for supporting webpack < 4 (i.e. detect/use outdated webpackConfig.module.loaders)
    let targetList = webpackConfig.module.rules || (useRulesForLoaders? null : (webpackConfig.module as any).loaders);
    if(!targetList){
        targetList = [];
        webpackConfig.module[useRulesForLoaders? 'rules': 'loaders'] = targetList;
    }
    //check & add exclude-filters (for mmir files/resources) to existing module-rules if necessary:
    modifyModuleRuleFilters(targetList);

    //HACK for webpack >= v4: does add some modules.defaultRules, which may prevent loading *.wasm files as raw files, and instead tries to use an (experimental!!!) wasm-loader
    if(Array.isArray(webpackConfig.module.defaultRules)){

        modifyModuleRuleFilters(webpackConfig.module.defaultRules as WebpackRule[]);

    } else if(useRulesForLoaders && mmirAppConfig.fixWebpack4DefaultRulesForWASM) {
        //TODO "auto-fix" by detecting webpack version instead of explicit option fixWebpack4DefaultRulesForWASM?
        //     (e.g. use require('mmir-tooling/utils/packageUtils').checkPackageVersion('webpack', '= 4.x.x'))

        // copied (slightly modified) default rules from webpack sources:
        // https://github.com/webpack/webpack/blob/v4.46.0/lib/WebpackOptionsDefaulter.js#L60-L85
        webpackConfig.module.defaultRules = modifyModuleRuleFilters([
            {
                type: "javascript/auto",
                resolve: {}
            },
            {
                test: /\.mjs$/i,
                type: "javascript/esm",
                resolve: {
                    mainFields:
                        webpackConfig.target === "web" ||
                        webpackConfig.target === "webworker" ||
                        webpackConfig.target === "electron-renderer"
                            ? ["browser", "main"]
                            : ["main"]
                }
            },
            {
                test: /\.json$/i,
                type: "json"
            },
            {
                test: /\.wasm$/i,
                type: "webassembly/experimental"
            }
        ]);
    }

    for(let i = 0, size = moduleRules.length; i < size; ++i){
        targetList.push(moduleRules[i]);
    }

    //add alias resolving:
    const alias = createResolveAlias(mmirAppConfig, rootDir, webpackRootDir);
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
    var plugins = createPlugins(webpackInstance, alias, mmirAppConfig, buildConfig);
    if(!webpackConfig.plugins){
        webpackConfig.plugins = plugins;
    } else {
        for(var i = 0, size = plugins.length; i < size; ++i){
            webpackConfig.plugins.push(plugins[i]);
        }
    }

    //add webworker loader configuration
    workerLoaderUtils.apply(webpackConfig, rootDir, useRulesForLoaders);

    return webpackConfig;
};

export = apply;
