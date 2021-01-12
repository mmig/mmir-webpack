
import fileUtils from 'mmir-tooling/utils/filepath-utils';
import implGen from 'mmir-tooling/impl/impl-gen';

const loaderUtils = require('loader-utils');

export = function(content, map, meta) {
    var callback = this.async();

    var options = loaderUtils.getOptions(this) || {};
    // log('mmir-impl-loader: options -> ', options);//DEBU
    if(!options.mapping){
        callback('failed to parse implementation: missing list for impl. settings [{id: "the ID", file: "the file path", ...}, ...]');
        return;/////////////// EARLY EXIT /////////////////
    }

    var implFile = fileUtils.normalizePath(this.resource);

    implGen.compile(content, implFile, options, callback, map, meta);
    return;
};
