"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const lodash_1 = require("lodash");
const filepath_utils_1 = __importDefault(require("mmir-tooling/utils/filepath-utils"));
const package_utils_1 = __importDefault(require("./utils/package-utils"));
const create_build_config_1 = require("mmir-tooling/tools/create-build-config");
const grammar_utils_1 = __importDefault(require("mmir-tooling/grammar/grammar-utils"));
const webpack_module_init_gen_js_1 = __importDefault(require("./utils/webpack-module-init-gen.js"));
const webpack_worker_loader_utils_1 = __importDefault(require("./utils/webpack-worker-loader-utils"));
const webpack_plugin_replace_id_js_1 = require("./utils/webpack-plugin-replace-id.js");
const webpack_resources_config_1 = __importDefault(require("./webpack-resources-config"));
const cli_utils_1 = __importDefault(require("mmir-tooling/utils/cli-utils"));
const log_utils_1 = __importDefault(require("mmir-tooling/utils/log-utils"));
const log = log_utils_1.default.log;
const warn = log_utils_1.default.warn;
// log('mmir-lib: ', require('mmir-lib'))
const rootDir = path_1.dirname(require.resolve('mmir-lib'));
const webpackRootDir = __dirname;
// log('mmir-lib path: ', rootDir);
// log('mmir-webpack path: ', webpackRootDir);
/**
 *	expand require.js package definitions & add them to the alias dictionary
 *
 * TODO extract this function to mmir-tooling?
 *
 * @param  {string} rootDir the mmir root dir (usually node_modules/mmir-lib/lib/ )
 * @param  {{[id: string]: string}} alias dictionary for module ID/alias -> module-path (INOUT parameter)
 * @param  {Array<{name: string, location: string}>} resourcesConfigPackages list of require.js package definitions
 */
function expandPackageResources(rootDir, alias, resourcesConfigPackages) {
    var getFiles = function (dir, relDir, baseId) {
        var files = fs_1.readdirSync(dir);
        files.forEach(function (f) {
            var absPath = path_1.join(dir, f);
            var relPath = relDir ? path_1.join(relDir, f) : f;
            if (filepath_utils_1.default.isDirectory(absPath)) {
                getFiles(dir, relPath);
            }
            else {
                //create id for file/module (without file-extension):
                var fid = filepath_utils_1.default.normalizePath(path_1.join(baseId, path_1.basename(relPath, path_1.extname(relPath))));
                alias[fid] = absPath;
                // console.log('  added package module ', fid, ' -> ', absPath);
            }
        });
    };
    // list: Array<{name: string, location: string}>
    resourcesConfigPackages.forEach(function (p) {
        getFiles(path_1.join(rootDir, p.location), '', p.name);
    });
}
function createResolveAlias(mmirAppConfig) {
    var paths = webpack_resources_config_1.default.paths;
    var alias = {}, p;
    for (var n in paths) {
        p = paths[n];
        if (/^build-tool\//.test(n)) {
            alias[n] = path_1.isAbsolute(p) ? p : path_1.join(webpackRootDir, p);
        }
        else {
            alias[n] = path_1.isAbsolute(p) ? p : path_1.join(rootDir, p);
        }
    }
    if (Array.isArray(webpack_resources_config_1.default.packages)) {
        expandPackageResources(rootDir, alias, webpack_resources_config_1.default.packages);
    }
    webpack_module_init_gen_js_1.default.addAliasFrom(mmirAppConfig, alias);
    if (mmirAppConfig.disableLogging) {
        alias['mmirf/logger'] = alias['mmirf/loggerDisabled'];
    }
    return alias;
}
function enableJQuery(mmirAppConfig) {
    mmirAppConfig.jquery = true;
    var paths = webpack_resources_config_1.default.paths;
    paths['mmirf/util'] = 'tools/util_jquery';
}
function createModuleRules(mmirAppConfig, buildConfig) {
    var appRootDir = mmirAppConfig.rootPath;
    //FIXME currently cannot include grammar.json as file because of json-grammar-loader TODO include same resouce multiple times with different formats(?) multi-loader?
    buildConfig.settings.forEach(function (s) {
        if (!s.exclude) {
            if (lodash_1.isArray(s.file) && s.include !== 'inline') {
                warn('WARN settings-utils: encountered multiple file resources for "' + s.id + '" (' + s.type + '): cannot be included as (single) file, inlining  resources instead...');
                s.include = 'inline';
            }
            else if (s.type === 'grammar' && s.include !== 'inline') {
                warn('WARN: cannot include JSON grammars as file, inlining grammar source for "' + s.id + '" instead ...');
                s.include = 'inline';
            }
            else if (s.type === 'speech' && s.value && s.include !== 'inline') {
                warn('WARN cannot include speech-config with modified value as JSON file, inlining speech-config for "' + s.id + '" instead ..."');
                s.include = 'inline';
            }
        }
    });
    var mmirAppConfigContent = webpack_module_init_gen_js_1.default.generateModuleCode(mmirAppConfig);
    var appConfigModulePath = filepath_utils_1.default.normalizePath(path_1.join(webpackRootDir, 'runtime', 'webpackModuleInit.js'));
    // log('###### creating module webpack-app-module-config.js with contents: '+ JSON.stringify(mmirAppConfigContent));
    var binFilePaths = webpack_resources_config_1.default.fileResources.map(function (val) {
        return filepath_utils_1.default.normalizePath(path_1.isAbsolute(val) ? val : path_1.join(rootDir, val));
    });
    //log('###### including as raw files: '+ binFilePaths);
    var textFilePaths = webpack_resources_config_1.default.textResources.map(function (val) {
        return filepath_utils_1.default.normalizePath(path_1.isAbsolute(val) ? val : path_1.join(rootDir, val));
    });
    // log('###### including as text files: '+ textFilePaths);
    var fileResourcesPathMap = webpack_resources_config_1.default.resourcesPaths;
    var moduleRules = [
        // handle binary files (e.g. *.mp3):
        {
            test: filepath_utils_1.default.createFileTestFunc(binFilePaths, ' for [raw file]'),
            use: {
                loader: 'file-loader',
                options: package_utils_1.default.setOptionIf({
                    name: function (file) {
                        if (fileResourcesPathMap && fileResourcesPathMap[filepath_utils_1.default.normalizePath(file)]) {
                            //if there is an explicit mapping entry, use the entry:
                            log('  including [raw file] from plugin, remapping include-path "' + file + '" -> ', fileResourcesPathMap[filepath_utils_1.default.normalizePath(file)]);
                            file = fileResourcesPathMap[filepath_utils_1.default.normalizePath(file)];
                        }
                        else if (file.indexOf(rootDir) === 0) {
                            //use relative path path (from mmir-lib root) in target/output directory for the resouce:
                            log('  including [raw file], remapping include-path "' + file + '" -> ', file.substring(rootDir.length).replace(/^(\\|\/)/, ''));
                            file = file.substring(rootDir.length).replace(/^(\\|\/)/, '');
                        }
                        else {
                            //otherwise: include as bare file-name
                            log('  including [raw file] remapping include-path "' + file + '" -> ', path_1.basename(file));
                            file = path_1.basename(file);
                        }
                        //do normalize path-separators to '/' for proper usage in JS code -> "var url = require(<file resource>)"
                        return filepath_utils_1.default.normalizePath(file);
                    }
                }, 
                //set compatiblity option: if file-loader >= 5.0.0 set 'esModule' to false, otherwise set 'esModules' to false
                'esModule', 'esModules', false, false, 'file-loader', '>= 5.0.0')
            }
        },
        // creates a module implementation for the app-config:
        {
            test: filepath_utils_1.default.createFileTestFunc([appConfigModulePath], ' for [app config]'),
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
            test: filepath_utils_1.default.createFileTestFunc(textFilePaths, ' for [text files]'),
            use: {
                loader: 'raw-loader'
            }
        }
    ];
    if (buildConfig.grammars.length > 0) {
        // compile JSON grammars & include executables if necessary:
        moduleRules.push({
            test: filepath_utils_1.default.createFileTestFunc(buildConfig.grammars.map(function (g) { return g.file; }), ' for [grammar] files'),
            use: {
                loader: path_1.resolve(webpackRootDir, 'loader', 'grammar-loader.js'),
                options: { mapping: buildConfig.grammars, config: buildConfig.grammarOptions },
            },
            type: 'javascript/auto'
        });
    }
    if (buildConfig.views.length > 0) {
        // compile view templates & include if necessary:
        moduleRules.push({
            test: filepath_utils_1.default.createFileTestFunc(buildConfig.views.map(function (v) { return v.file; }), ' for [view] files'),
            use: {
                loader: path_1.resolve(webpackRootDir, 'loader', 'view-loader.js'),
                options: { mapping: buildConfig.views, config: buildConfig.viewOptions },
            },
            type: 'javascript/auto'
        });
    }
    if (buildConfig.states.length > 0) {
        // compile SCXML models & include if necessary:
        moduleRules.push({
            test: filepath_utils_1.default.createFileTestFunc(buildConfig.states.map(function (s) { return s.file; }), ' for [scxml] files'),
            use: {
                loader: path_1.resolve(webpackRootDir, 'loader', 'scxml-loader.js'),
                options: { mapping: buildConfig.states, config: buildConfig.stateOptions },
            },
            type: 'javascript/auto'
        });
    }
    //FIXME TODO: else include default/minimal state engines
    if (buildConfig.implList.length > 0) {
        // load & pre-process implemetation files if necessary
        moduleRules.push({
            test: filepath_utils_1.default.createFileTestFunc(buildConfig.implList.map(function (s) { return s.file; }), ' for [controller | helper | model] files'),
            use: {
                loader: path_1.resolve(webpackRootDir, 'loader', 'impl-loader.js'),
                options: { mapping: buildConfig.implList },
            },
            type: 'javascript/auto'
        });
    }
    var settingsFiles = buildConfig.settings.filter(function (s) { return s.include === 'file'; });
    if (settingsFiles && settingsFiles.length > 0) {
        if (!mmirAppConfig.webpackPlugins) {
            mmirAppConfig.webpackPlugins = [];
        }
        mmirAppConfig.webpackPlugins.push(function (webpackInstance, alias) {
            return new webpackInstance.NormalModuleReplacementPlugin(/mmirf\/settings\/(configuration|dictionary|grammar|speech)\//i, function (resource) {
                if (alias[resource.request]) {
                    // log('NormalModuleReplacementPlugin: redirecting resource: ', resource, ' -> ', alias[resource.request]);//DEBU
                    // resource.request = alias[resource.request];//DISABLED hard-rewire request ... instead, add an alias resolver (see below)
                    var ca = {};
                    ca[resource.request] = alias[resource.request];
                    resource.resolveOptions = { alias: ca };
                }
            });
        });
        moduleRules.push({
            test: filepath_utils_1.default.createFileTestFunc(buildConfig.settings.filter(function (s) { return !lodash_1.isArray(s.file) && s.type !== 'grammar'; }).map(function (s) { return s.file; }), ' for [language resource] files'),
            use: {
                loader: 'file-loader',
                options: {
                    name: function (file) {
                        // var ofile = file;//DEBU
                        var root = appRootDir;
                        //use relative path (from root) in target/output directory for the resouce:
                        if (file.indexOf(root) === 0) {
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
function createPlugins(webpackInstance, alias, mmirAppConfig, buildConfig) {
    // var CResolver = require('./webpack-plugin-custom-resolver.js');
    // var EncodingPlugin = require('webpack-encoding-plugin');
    // console.log('buildConfig', buildConfig)
    var plugins = [
        // enable replacement implementation for requirejs' module.config()
        // NOTE: in difference to the requirejs implementation, this does need the module as first parameter, i.e. something like
        //      module.config(module) -> webpack_build_tool_module_config_helper_config(module)
        new webpackInstance.ProvidePlugin({
            'module.config': ['build-tool/module-config-helper', 'config'],
        }),
        // ignore modules that are specific for running mmir in node environment:
        new webpackInstance.IgnorePlugin({ resourceRegExp: /^xmlhttprequest|worker_threads$/ }),
        // set custom module-IDs from alias-definitions for mmir-modules (enables mmir.require(<moduleId>))
        new webpack_plugin_replace_id_js_1.ReplaceModuleIdPlugin(alias, rootDir, /\.((ehtml)|(js(on)?))$/i),
        // new CResolver(alias),//FIXME TEST
        // set environment variable WEBPACK_BUILD for enabling webpack-specific code
        new webpackInstance.DefinePlugin({
            'WEBPACK_BUILD': JSON.stringify(true),
        }),
        // redirect entry-point of mmir-lib to the webpack bootstrap/entry point
        new webpackInstance.NormalModuleReplacementPlugin(/requirejs-main\.js/, function (resource) {
            if (resource.rawRequest === 'mmir-lib') { //<- only redirect, if the file was requested via 'mmir-lib' (e.g. if requested directly via its path, do not redirect)
                // log('replacing module ', resource.request, ' -> ', join(webpackRootDir, 'webpack-main.js'))//, ', for ', resource);
                resource.request = path_1.join(webpackRootDir, 'webpack-main.js');
                resource.resource = resource.request;
            }
            // else {
            // 	log('ingnoring module replacement for ', resource.request);
            // }
        }),
        // // redirect 'mmirf/util/fileLoader'
        new webpackInstance.NormalModuleReplacementPlugin(/^mmirf\/util\/loadFile(__webpack_proxied)?$/, function (resource) {
            if (/__webpack_proxied$/.test(resource.request)) {
                var modPath = path_1.resolve(alias['mmirf/util'], 'loadFile.js');
                // log('------------- replacing module ', resource.request, ' -> ', modPath);
                resource.request = modPath;
            }
            else {
                // log('############# replacing module ', resource.request, ' -> ', alias['mmirf/util/resourceLoader']);
                resource.request = alias['mmirf/util/resourceLoader'];
            }
        }),
        // FIXME somehow require-ing .ehtml resources (i.e. "mmirf/view/...") is not processed as module-request, so neither normal alias-resolving nor the replace-id plugin is triggered...
        //       ... hard-rewire the requires view-IDs to the
        new webpackInstance.NormalModuleReplacementPlugin(/mmirf\/(view|controller|grammar|helper|model|scxml)\//i, function (resource) {
            if (alias[resource.request]) {
                // log('NormalModuleReplacementPlugin: redirecting resource: ', resource, ' -> ', alias[resource.request]);
                var ca = {};
                ca[resource.request] = alias[resource.request];
                resource.resolveOptions = { alias: ca };
            }
        }),
    ];
    //configure dependencies within WebWorker in case async-execution for grammar is enable for at least 1 grammar:
    // create resource/ID mapping for including async-exec grammars in WebWorker script
    if (buildConfig.grammars && buildConfig.grammars.length > 0) {
        var execAsyncGrammarIdMap = {};
        var isAsyncExec = false;
        buildConfig.grammars.forEach(function (g) {
            if (g.async) {
                isAsyncExec = true;
                execAsyncGrammarIdMap['./' + g.id] = grammar_utils_1.default.toAliasId(g);
            }
        });
        //only create mapping function & plugin instance etc, if at least 1 async-exec grammar is present:
        if (isAsyncExec) {
            var ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
            var createAsyncGrammarContextMap = (_fs, callback) => {
                // console.log('###################### ContextReplacementPlugin.newContentCreateContextMap() -> ', callback)
                callback(null, execAsyncGrammarIdMap);
            };
            plugins.push(
            //TODO for async-grammar-exec: do include all referenced compiled grammars in its web-worker script
            new webpackInstance.ContextReplacementPlugin(/^.\/\<mmir-async-grammar-exec\>/, //<- placeholder URI in mmir-lib's asyncGrammarWorker for loading/including async-exec grammars in WebWorker script
            function (context) {
                //NOTE adapted from ContextReplacementPlugin's handling of map-option
                context.resolveDependencies = (fs, options, callback) => {
                    createAsyncGrammarContextMap(fs, (err, map) => {
                        if (err)
                            return callback(err);
                        const dependencies = Object.keys(map).map(key => {
                            return new ContextElementDependency(map[key] + options.resourceQuery, key);
                        });
                        callback(null, dependencies);
                    });
                };
                Object.assign(context, {
                    //NOTE need any directory in order to trigger parsing of directory which in turn allows to attach multiple ContextElementDependency
                    request: __dirname
                });
            }) //END: new ...
            ); //END: plugins.push(...
        } //END: if(isAsyncExec)
    } //END: if(createAsyncGrammarContextMap)
    if (mmirAppConfig.webpackPlugins) {
        mmirAppConfig.webpackPlugins.forEach(function (p) {
            plugins.push(typeof p === 'function' ? p(webpackInstance, alias, mmirAppConfig) : p);
        });
    }
    return plugins;
}
;
/**
 * HELPER check existing module-rules and exclude mmir-files if necessary
 *
 * @param {Array<webpack/Rule>} moduleRules the module.rules list of the webpack configuration
 */
function modifyModuleRuleFilters(moduleRules) {
    if (!moduleRules || moduleRules.length === 0) {
        return;
    }
    var rawFilePaths = webpack_resources_config_1.default.fileResources.map(function (val) {
        return filepath_utils_1.default.normalizePath(path_1.isAbsolute(val) ? val : path_1.join(rootDir, val));
    });
    moduleRules.forEach(function (rule) {
        // console.log('checking module.rule ', rule)
        var test = rule.test || (rule.resource ? rule.resource.test : null);
        if (test) {
            var isMatch = false, file;
            for (var i = 0, size = rawFilePaths.length; !isMatch && i < size; ++i) {
                file = rawFilePaths[i];
                // console.log('checkin module.rule (test type: '+(typeof test)+') for file ', file);
                isMatch = testFileForModuleRuleCondition(file, test);
            }
            if (isMatch) {
                // console.log('WARN module.rule does match mmir-file -> ', rule)
                excludeFilesFromModuleRule(rawFilePaths, rule);
            }
        }
    });
}
;
/**
 * HELPER test if file matches the module.rule test-condition(s)
 *
 * @param  {string} file the file(-path) to test
 * @param  {webpack/Condition} test the module.rule's condition(s)
 * @return {boolean} the test result
 */
function testFileForModuleRuleCondition(file, test) {
    var isMatch = false;
    switch (typeof test) {
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
            if (test instanceof RegExp) {
                test.lastIndex = 0;
                isMatch = test.test(file);
                test.lastIndex = 0;
                // console.log('  checked RegExp module.rule.test for match: ', isMatch)
                break;
            }
            else if (Array.isArray(test)) {
                for (var i = 0, size = test.length; i < size; ++i) {
                    isMatch = testFileForModuleRuleCondition(file, test[i]);
                    if (isMatch) {
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
}
;
/**
 * HELPER add exclude-condition to module.rule for a list of (mmir) files
 *
 * @param  {Array<string>} fileList the file-list which should be added to the exclude condition
 * @param  {webpack/Rule} moduleRule the module rule
 */
function excludeFilesFromModuleRule(fileList, moduleRule) {
    var exclude = moduleRule.exclude || (moduleRule.resource ? moduleRule.resource.exclude : null);
    var exclFunc = filepath_utils_1.default.createFileTestFunc(fileList, ' for excluding [raw file] from module.rule');
    if (exclude) {
        if (Array.isArray(exclude)) {
            exclude.push(exclFunc);
        }
        else {
            exclude = [exclude, exclFunc];
            if (moduleRule.exclude) {
                moduleRule.exclude = exclude;
            }
            else {
                moduleRule.resource.exclude = exclude;
            }
        }
    }
    else {
        moduleRule.exclude = exclFunc;
    }
}
;
/**
 * apply webpack configuration for mmir-lib to an existing webpack configuration
 *
 * @param  {[type]} webpackInstance the webpack instance, e.g. retrieve via require('webpack')
 * @param  {[type]} webpackConfig the existing webpack configuration
 * @param  {[type]} mmirAppConfig app-specific configuration for mmir-lib
 */
function apply(webpackInstance, webpackConfig, mmirAppConfig) {
    // log('############################## webpack-version: ', JSON.stringify(webpackInstance.version))
    // log('############################## webpack instance: ', webpackInstance)
    cli_utils_1.default.parseCli();
    var useRulesForLoaders = webpackInstance.version && parseFloat(webpackInstance.version) >= 4 ? true : false;
    if (typeof mmirAppConfig === 'string') {
        mmirAppConfig = JSON.parse(mmirAppConfig);
    }
    else if (!mmirAppConfig) {
        mmirAppConfig = {};
    }
    if (mmirAppConfig.jquery) {
        enableJQuery(mmirAppConfig);
    }
    // var resourcesConfig = require('./webpack-resources-config');
    var buildConfig = create_build_config_1.createBuildConfig(mmirAppConfig, webpack_resources_config_1.default);
    if (typeof buildConfig === 'string') {
        throw new Error(buildConfig);
    }
    //add loader configurations:
    // (NOTE must do this before creating alias definition as some loaders may add alias mappings to mmirAppConfig)
    var moduleRules = createModuleRules(mmirAppConfig, buildConfig);
    if (!useRulesForLoaders) {
        moduleRules.forEach(function (rule) {
            if (rule.type) {
                if (rule.use && rule.use.options) {
                    rule.use.options.isRuleTypeDisabled = true;
                }
                delete rule.type;
            }
        });
    }
    if (!webpackConfig.module) {
        webpackConfig.module = {};
    }
    //NOTE: compatiblity code for supporting webpack < 4 (i.e. detect/use outdated webpackConfig.module.loaders)
    let targetList = webpackConfig.module.rules || (useRulesForLoaders ? null : webpackConfig.module.loaders);
    if (!targetList) {
        targetList = [];
        webpackConfig.module[useRulesForLoaders ? 'rules' : 'loaders'] = targetList;
    }
    //check & add exclude-filters (for mmir files/resources) to existing module-rules if necessary:
    modifyModuleRuleFilters(targetList);
    for (let i = 0, size = moduleRules.length; i < size; ++i) {
        targetList.push(moduleRules[i]);
    }
    //add alias resolving:
    const alias = createResolveAlias(mmirAppConfig);
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = { alias: alias };
    }
    else {
        if (webpackConfig.resolve.alias) {
            Object.assign(webpackConfig.resolve.alias, alias);
        }
        else {
            webpackConfig.resolve.alias = alias;
        }
    }
    // console.log('webpackConfig.resolve.alias: ', JSON.stringify(webpackConfig.resolve.alias));
    //add plugins
    var plugins = createPlugins(webpackInstance, alias, mmirAppConfig, buildConfig);
    if (!webpackConfig.plugins) {
        webpackConfig.plugins = plugins;
    }
    else {
        for (var i = 0, size = plugins.length; i < size; ++i) {
            webpackConfig.plugins.push(plugins[i]);
        }
    }
    //add webworker loader configuration
    webpack_worker_loader_utils_1.default.apply(webpackConfig, rootDir, useRulesForLoaders);
    return webpackConfig;
}
;
module.exports = apply;
