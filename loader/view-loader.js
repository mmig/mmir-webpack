
var loaderUtils = require('loader-utils');

var fileUtils = require('mmir-tooling/utils/filepath-utils.js');
var viewGen = require('mmir-tooling/view/view-gen.js');

module.exports = function(content, map, meta) {

	var callback = this.async();

	var options = loaderUtils.getOptions(this) || {};
	// log('mmir-view-loader: options -> ', options);//DEBU
	if(!options || !options.mapping){
		callback('failed to parse view template: missing list for view settings [{id: "the ID", file: "the file path", ...}, ...]');
		return;/////////////// EARLY EXIT /////////////////
	}

	var viewFile = fileUtils.normalizePath(this.resource);
	// log('mmir-view-loader: resource -> ', viewFile);//DEBU

	viewGen.compile(content, viewFile, options, callback, map, meta);
	return;
};
