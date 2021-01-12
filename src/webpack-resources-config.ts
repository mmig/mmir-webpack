
import { resolve } from 'path';
import createResourcesConfig from 'mmir-tooling/tools/create-resources-config';

//remove paths that match the ID from mmir base paths:
const webpackRemovedPaths = ['jquery'];

//NOTE: non-absolute paths will be resolved against the mmir-lib package's path

const webpackDefaultPaths = {

    'mmirf/scion': 'vendor/libs/scion-amd-mod',
    'mmirf/simpleViewEngine': 'env/view/stubViewEngine',
    //use non-jQuery utils by default:
    'mmirf/util': 'tools/util_purejs',

    'mmirf/util/resourceLoader': resolve(__dirname, 'runtime', 'webpackLoadFile'),

    'build-tool/module-config-helper':         resolve(__dirname, 'runtime', 'moduleConfigImpl'),
    'build-tool/webpack-helper-module-config': resolve(__dirname, 'runtime', 'webpackModuleUtils'),
    'build-tool/webpack-app-config':           resolve(__dirname, 'runtime', 'webpackModuleInit')
};

export = createResourcesConfig(webpackRemovedPaths, webpackDefaultPaths);
