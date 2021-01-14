/* ********************************************* */
/* ** NOTE do not change directly:            ** */
/* **      original source file is located at ** */
/* **      /assets/index.d.ts                 ** */
/* ********************************************* */
/**
 * `mmir-webpack` integrates `mmir-lib` into _webpack_-built apps
 *
 * @module mmir-webpack
 */
/** <dummy comment: required for typedoc to correctly interpret above @module annotation> */
import { WebpackAppConfig as _WebpackAppConfig } from 'mmir-tooling';
import { Configuration as WebpackConfiguration } from 'webpack';
import * as webpack from 'webpack';
/**
 *
 * @module mmir-webpack
 */
export = mmirWebpackFunc;
/**
 * apply the `mmirWebpackConfig` configuration the (existing) _webpack_
 * configuration `webpackConfig`.
 *
 * @param webpackInstance 		the _webpack_ instance, i.e. `require('webpack')` (supports _webpack_ versions 3.x - 4.x)
 *
 * @param webpackConfig 			the (existing) _webpack_ configuration for the app: will be extended/modified with _mmir_
 * 															_webpack_ configuration\
 * 									 						NOTE this (modified) object will also be returned by this function, i.e. it is an INOUT parameter
 *
 * @param mmirWebpackConfig 	the _mmir_ configuration
 *
 * @returns the modified (paramater) `webpackConfig`
 *
 * @module mmir-webpack
 */
declare function mmirWebpackFunc(webpackInstance: typeof webpack, webpackConfig: WebpackConfiguration, mmirWebpackConfig: mmirWebpackFunc.WebpackAppConfig): WebpackConfiguration;
/**
 * `mmir-webpack` integrates `mmir-lib` into _webpack_-built apps:
 *
 * include `mmir-lib`, configure _mmir_, include/compile/generate _mmir_ resources
 * (e.g. grammars, state-models), _mmir_-plugins, ...
 *
 * @module mmir-webpack
 */
declare namespace mmirWebpackFunc {
    export type WebpackAppConfig = _WebpackAppConfig;
    export type WebpackModuleConfiguration = WebpackConfiguration;
    export type WebpackModule = typeof webpack;
}
