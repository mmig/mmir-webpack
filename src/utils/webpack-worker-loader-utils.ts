var path = require('path');

import fileUtils from 'mmir-tooling/utils/filepath-utils';
import packageUtils from './package-utils';

import resources from '../webpack-resources-config.js';
import { WebpackModuleConfiguration } from '../index.d';

function createWebWorkerLoaderConfig(rootDir: string, isWebpack3: boolean): {test: (path: string) => boolean, use: {loader: 'worker-loader', options: {[option:string]: any}}} {

    const webworkerPaths = resources.workers.map(function(val: string){
        return fileUtils.normalizePath(path.isAbsolute(val)? val : path.join(rootDir, val));
    });


    // console.log('webworkerPaths: ', webworkerPaths);

    const testWebWorkerFunc = fileUtils.createFileTestFunc(webworkerPaths, ' for [web worker]');

    //create compatiblity options: for worker-loader < 3.x use option-name "name", otherwise "filename";
    const fileNameTemplate = isWebpack3? 'worker-[name].[hash].js' : 'worker-[name].[contenthash].js';
    const options = packageUtils.setOptionIf({}, 'filename', 'name', fileNameTemplate, false, 'worker-loader', '>= 3.0.0');
	//create compatiblity options for worker-loader < 3.x: must set esModule to false (and for lower worker-versions, must not set the option)
	packageUtils.setOptionIf(options, 'esModule', null, false, false, 'worker-loader', '>= 3.0.0');

    return {
        test: testWebWorkerFunc,
        use: {
            loader: 'worker-loader',
            options: options
        }
    };
}

export = {
    config: null,
    apply: function(webpackConfig: WebpackModuleConfiguration, rootDir: string, useRulesForLoaders: boolean): WebpackModuleConfiguration {
        var webWorkerLoaderConfig = createWebWorkerLoaderConfig(rootDir, !useRulesForLoaders);
        this.config = webWorkerLoaderConfig;
        webpackConfig = webpackConfig || {};
        if (!webpackConfig.module) {
            webpackConfig.module = {};
        }
        var targetList = webpackConfig.module.rules || (useRulesForLoaders ? null : (webpackConfig.module as any).loaders);
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
