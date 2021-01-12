"use strict";
/*
 * generates (strigified) module code from app-specific configruation:
 *  * additional/replaced modules/module-paths
 *  * included (optional) modules/functionality
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const fs_1 = require("fs");
const appConfigUtils = __importStar(require("mmir-tooling/utils/module-config-init"));
/**
 * [description]
 * @param  {PlainObject} mmirAppConfig JSON-like configuration object:
 * 							mmirAppConfig.config: module configuration object (analogous to requirejs module configuration)
 * 							mmirAppConfig.paths: mapping of module names to file-paths (additional or overwriting implemenation of existing modules)
 * @return {string} stringified module code
 */
function generateFromAppConfig(mmirAppConfig) {
    var moduleImplStr = '';
    var moduleExportsStr = '';
    if (mmirAppConfig) {
        var moduleExports = [];
        if (mmirAppConfig.config) {
            moduleImplStr += 'var appConfig = ' + JSON.stringify([{ config: mmirAppConfig.config }], null, 2) + ';\n';
            moduleExports.push(['configList', 'appConfig']);
            // console.log('app config module -> appConfig: ', moduleImplStr);
        }
        if (mmirAppConfig.includeModules) {
            // ['asyncGrammar'] -> 'var doIncludeModules = function(){\n  require.resolve("mmirf/asyncGrammar");\n};\n';
            var rePrefix = /^(mmirf\/)|mmir-plugin-/;
            moduleImplStr += 'var doIncludeModules = function(){\n' +
                mmirAppConfig.includeModules.map(function (incl) {
                    incl = rePrefix.test(incl) || fs_1.existsSync(incl) ? incl : 'mmirf/' + incl;
                    return '  require.resolve("' + incl + '");';
                }).join('\n') +
                '\n};\n';
            moduleExports.push(['applyIncludes', 'doIncludeModules']);
            // console.log('app config module -> includeModules: ', moduleImplStr);
        }
        if (mmirAppConfig.loadAfterInit) {
            // ['grammar/de'] -> 'var doLoadAfterInit = function(){\n  require("mmirf/grammar/de");\n};\n';
            var rePrefix = /^(mmirf\/)|mmir-plugin-/;
            moduleImplStr += 'var doLoadAfterInit = function(){\n' +
                mmirAppConfig.loadAfterInit.map(function (incl) {
                    incl = rePrefix.test(incl) || fs_1.existsSync(incl) ? incl : 'mmirf/' + incl;
                    return '  require("' + incl + '");';
                }).join('\n') +
                '\n};\n';
            moduleExports.push(['applyAutoLoads', 'doLoadAfterInit']);
            // console.log('app config module -> doLoadAfterInit: ', moduleImplStr);
        }
        if (mmirAppConfig.loadBeforeInit) {
            // ['polyfill'] -> 'var doLoadBeforeInit = function(){\n  require("mmirf/polyfill");\n};\n';
            var rePrefix = /^(mmirf\/)|mmir-plugin-/;
            moduleImplStr += 'var doLoadBeforeInit = function(){\n' +
                mmirAppConfig.loadBeforeInit.map(function (incl) {
                    incl = rePrefix.test(incl) || fs_1.existsSync(incl) ? incl : 'mmirf/' + incl;
                    return '  require("' + incl + '");';
                }).join('\n') +
                '\n};\n';
            moduleExports.push(['applyAutoPreloads', 'doLoadBeforeInit']);
            // console.log('app config module -> doLoadBeforeInit: ', moduleImplStr);
        }
        if (mmirAppConfig.runtimeSettings) {
            moduleImplStr += 'var appSettings = ' + JSON.stringify(mmirAppConfig.runtimeSettings, null, 2) + ';\n';
            moduleExports.push(['settings', 'appSettings']);
            // console.log('app config module -> settings: ', moduleImplStr);
        }
        if (mmirAppConfig.jquery) {
            moduleImplStr += 'var doInitJQuery = function(){ require("mmirf/core").jquery = require("jquery"); };\n';
            moduleExports.push(['jqueryInit', 'doInitJQuery']);
        }
        moduleExportsStr = moduleExports.length > 0 ?
            '{' + (moduleExports.map(function (pairs) {
                return pairs[0] + ': ' + pairs[1];
            })).join(',\n') +
                '};' : 'false;';
    }
    else {
        moduleExportsStr = 'false;';
    }
    // console.log('app config module exports: ', moduleExportsStr);
    // // console.log('app config module impl.: ', moduleImplStr);
    return moduleImplStr + '\nmodule.exports=' + moduleExportsStr;
}
const webpackAppConfigUtils = appConfigUtils;
webpackAppConfigUtils.generateModuleCode = generateFromAppConfig;
module.exports = webpackAppConfigUtils;
