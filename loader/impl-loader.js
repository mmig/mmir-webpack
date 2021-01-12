"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const filepath_utils_1 = __importDefault(require("mmir-tooling/utils/filepath-utils"));
const impl_gen_1 = __importDefault(require("mmir-tooling/impl/impl-gen"));
const loaderUtils = require('loader-utils');
module.exports = function (content, map, meta) {
    var callback = this.async();
    var options = loaderUtils.getOptions(this) || {};
    // log('mmir-impl-loader: options -> ', options);//DEBU
    if (!options.mapping) {
        callback('failed to parse implementation: missing list for impl. settings [{id: "the ID", file: "the file path", ...}, ...]');
        return; /////////////// EARLY EXIT /////////////////
    }
    var implFile = filepath_utils_1.default.normalizePath(this.resource);
    impl_gen_1.default.compile(content, implFile, options, callback, map, meta);
    return;
};
