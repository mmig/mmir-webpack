
var loaderUtils = require('loader-utils');

var fileUtils = require('mmir-tooling/utils/filepath-utils');
var scxmlGen = require('mmir-tooling/scxml/scxml-gen');

module.exports = function(content, map, meta) {
	var callback = this.async();

	var options = loaderUtils.getOptions(this) || {};
	// log('mmir-scxml-loader: options -> ', options);//DEBU

	var scxmlFile = fileUtils.normalizePath(this.resource);

	scxmlGen.compile(content, scxmlFile, options, callback, map, meta);
	return;
};
