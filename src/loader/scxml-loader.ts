
import fileUtils from 'mmir-tooling/utils/filepath-utils';
import scxmlGen from 'mmir-tooling/scxml/scxml-gen';

import { getLoaderOptions } from '../utils/compat-utils';


export = function(content, map, meta) {
    var callback = this.async();

    var options = getLoaderOptions(this) || {};
    // log('mmir-scxml-loader: options -> ', options);//DEBU

    var scxmlFile = fileUtils.normalizePath(this.resource);

    scxmlGen.compile(content, scxmlFile, options, callback, map, meta);
    return;
};
