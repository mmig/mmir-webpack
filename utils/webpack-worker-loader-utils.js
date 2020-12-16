var path = require('path');
var fileUtils = require('mmir-tooling/utils/filepath-utils');
var packageUtils = require('./package-utils');

var resources = require('../webpack-resources-config.js');

var createWebWorkerLoaderConfig = function(rootDir){

	var webworkerPaths = resources.workers.map(function(val){
		return fileUtils.normalizePath(path.isAbsolute(val)? val : path.join(rootDir, val));
	});


	// console.log('webworkerPaths: ', webworkerPaths);

	var testWebWorkerFunc = fileUtils.createFileTestFunc(webworkerPaths, ' for [web worker]');

	//create compatiblity options: for worker-loader < 3.x use option-name "name", otherwise "filename";
	var options = packageUtils.setOptionIf({}, 'filename', 'name', 'worker-[name].[hash].js', false, 'worker-loader', '>= 3.0.0');

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
	apply: function(webpackConfig, rootDir, useRulesForLoaders) {
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
