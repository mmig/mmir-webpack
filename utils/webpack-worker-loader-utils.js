"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var path = require('path');
const filepath_utils_1 = __importDefault(require("mmir-tooling/utils/filepath-utils"));
const package_utils_1 = __importDefault(require("./package-utils"));
const webpack_resources_config_js_1 = __importDefault(require("../webpack-resources-config.js"));
function createWebWorkerLoaderConfig(rootDir) {
    const webworkerPaths = webpack_resources_config_js_1.default.workers.map(function (val) {
        return filepath_utils_1.default.normalizePath(path.isAbsolute(val) ? val : path.join(rootDir, val));
    });
    // console.log('webworkerPaths: ', webworkerPaths);
    const testWebWorkerFunc = filepath_utils_1.default.createFileTestFunc(webworkerPaths, ' for [web worker]');
    //create compatiblity options: for worker-loader < 3.x use option-name "name", otherwise "filename";
    const options = package_utils_1.default.setOptionIf({}, 'filename', 'name', 'worker-[name].[hash].js', false, 'worker-loader', '>= 3.0.0');
    //create compatiblity options for worker-loader < 3.x: must set esModule to false (and for lower worker-versions, must not set the option)
    package_utils_1.default.setOptionIf(options, 'esModule', null, false, false, 'worker-loader', '>= 3.0.0');
    return {
        test: testWebWorkerFunc,
        use: {
            loader: 'worker-loader',
            options: options
        }
    };
}
module.exports = {
    config: null,
    apply: function (webpackConfig, rootDir, useRulesForLoaders) {
        var webWorkerLoaderConfig = createWebWorkerLoaderConfig(rootDir);
        this.config = webWorkerLoaderConfig;
        webpackConfig = webpackConfig || {};
        if (!webpackConfig.module) {
            webpackConfig.module = {};
        }
        var targetList = webpackConfig.module.rules || (useRulesForLoaders ? null : webpackConfig.module.loaders);
        if (!targetList) {
            targetList = [];
            webpackConfig.module[useRulesForLoaders ? 'rules' : 'loaders'] = targetList;
        }
        var doAdd = true;
        var size = targetList.length;
        if (size > 0) {
            for (var i = 0; i < size; ++i) {
                var c = targetList[i];
                if (c && c.test === webWorkerLoaderConfig.test) {
                    doAdd = false;
                    break;
                }
            }
        }
        if (doAdd) {
            targetList.push(webWorkerLoaderConfig);
        }
        return webpackConfig;
    }
};
