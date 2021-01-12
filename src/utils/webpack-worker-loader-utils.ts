var path = require('path');

import fileUtils from 'mmir-tooling/utils/filepath-utils';
import packageUtils from './package-utils';

import resources from '../webpack-resources-config.js';
import { WebpackModuleConfiguration } from '../index.d';

function createWebWorkerLoaderConfig(rootDir: string): {test: (path: string) => boolean, use: {loader: 'worker-loader', options: {[option:string]: any}}} {

    const webworkerPaths = resources.workers.map(function(val: string){
        return fileUtils.normalizePath(path.isAbsolute(val)? val : path.join(rootDir, val));
    });


    // console.log('webworkerPaths: ', webworkerPaths);

    const testWebWorkerFunc = fileUtils.createFileTestFunc(webworkerPaths, ' for [web worker]');

    //create compatiblity options: for worker-loader < 3.x use option-name "name", otherwise "filename";
    const options = packageUtils.setOptionIf({}, 'filename', 'name', 'worker-[name].[hash].js', false, 'worker-loader', '>= 3.0.0');

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
        var webWorkerLoaderConfig = createWebWorkerLoaderConfig(rootDir);
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
