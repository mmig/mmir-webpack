"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const filepath_utils_1 = __importDefault(require("mmir-tooling/utils/filepath-utils"));
const view_gen_1 = __importDefault(require("mmir-tooling/view/view-gen"));
const compat_utils_1 = require("../utils/compat-utils");
module.exports = function (content, map, meta) {
    var callback = this.async();
    var options = (0, compat_utils_1.getLoaderOptions)(this) || {};
    // log('mmir-view-loader: options -> ', options);//DEBU
    if (!options || !options.mapping) {
        callback('failed to parse view template: missing list for view settings [{id: "the ID", file: "the file path", ...}, ...]');
        return; /////////////// EARLY EXIT /////////////////
    }
    var viewFile = filepath_utils_1.default.normalizePath(this.resource);
    // log('mmir-view-loader: resource -> ', viewFile);//DEBU
    view_gen_1.default.compile(content, viewFile, options, callback, map, meta);
    return;
};
