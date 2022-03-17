"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = require("path");
const create_resources_config_1 = __importDefault(require("mmir-tooling/tools/create-resources-config"));
//remove paths that match the ID from mmir base paths:
const webpackRemovedPaths = ['jquery'];
//NOTE: non-absolute paths will be resolved against the mmir-lib package's path
const webpackDefaultPaths = {
    'mmirf/scion': 'vendor/libs/scion-amd-mod',
    'mmirf/simpleViewEngine': 'env/view/stubViewEngine',
    //use non-jQuery utils by default:
    'mmirf/util': 'tools/util_purejs',
    'mmirf/util/resourceLoader': (0, path_1.resolve)(__dirname, 'runtime', 'webpackLoadFile'),
    'build-tool/module-config-helper': (0, path_1.resolve)(__dirname, 'runtime', 'moduleConfigImpl'),
    'build-tool/webpack-helper-module-config': (0, path_1.resolve)(__dirname, 'runtime', 'webpackModuleUtils'),
    'build-tool/webpack-app-config': (0, path_1.resolve)(__dirname, 'runtime', 'webpackModuleInit')
};
module.exports = (0, create_resources_config_1.default)(webpackRemovedPaths, webpackDefaultPaths);
