
var path = require('path');

var createResourcesConfig = require('mmir-tooling/tools/create-resources-config');

//remove paths that match the ID from mmir base paths:
var webpackRemovedPaths = ['jquery'];

//NOTE: non-absolute paths will be resolved against the mmir-lib package's path

var webpackDefaultPaths = {

	'mmirf/scion': 'vendor/libs/scion-amd-mod',
	'mmirf/simpleViewEngine': 'env/view/stubViewEngine',
	//use non-jQuery utils by default:
	'mmirf/util': 'tools/util_purejs',

	'mmirf/util/resourceLoader': path.resolve(__dirname, 'runtime', 'webpackLoadFile'),

	'build-tool/module-config-helper':         path.resolve(__dirname, 'runtime', 'moduleConfigImpl'),
	'build-tool/webpack-helper-module-config': path.resolve(__dirname, 'runtime', 'webpackModuleUtils'),
	'build-tool/webpack-app-config':           path.resolve(__dirname, 'runtime', 'webpackModuleInit')
};

module.exports = createResourcesConfig(webpackRemovedPaths, webpackDefaultPaths);
