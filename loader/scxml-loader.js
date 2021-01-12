"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const filepath_utils_1 = __importDefault(require("mmir-tooling/utils/filepath-utils"));
const scxml_gen_1 = __importDefault(require("mmir-tooling/scxml/scxml-gen"));
const loaderUtils = require('loader-utils');
module.exports = function (content, map, meta) {
    var callback = this.async();
    var options = loaderUtils.getOptions(this) || {};
    // log('mmir-scxml-loader: options -> ', options);//DEBU
    var scxmlFile = filepath_utils_1.default.normalizePath(this.resource);
    scxml_gen_1.default.compile(content, scxmlFile, options, callback, map, meta);
    return;
};
