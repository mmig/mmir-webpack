
import fileUtils from 'mmir-tooling/utils/filepath-utils';
import scxmlGen from 'mmir-tooling/scxml/scxml-gen';

const loaderUtils = require('loader-utils');

export = function(content, map, meta) {
    var callback = this.async();

    var options = loaderUtils.getOptions(this) || {};
    // log('mmir-scxml-loader: options -> ', options);//DEBU

    var scxmlFile = fileUtils.normalizePath(this.resource);

    scxmlGen.compile(content, scxmlFile, options, callback, map, meta);
    return;
};
