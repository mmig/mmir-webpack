/**
 * `mmir-webpack` integrates `mmir-lib` into _webpack_-built apps
 *
 * @module mmir-webpack
 */
/** <dummy comment: required for typedoc to correctly interpret above @module annotation> */

import { AppConfig , ModulePaths, ModuleId, ModuleConfigOptions, SettingsOptions, RuntimeConfiguration, PluginOptions, ControllerOptions, HelperOptions, ModelOptions } from 'mmir-tooling';

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

	/**
	 * @example
	 * ```
	 * var appConfig = {
	 * 	//path to directory that contains classic mmir directory structure
	 * 	resourcesPath: 'src/mmir',
	 * 	resourcesPathOptions: {
	 * 		//for included models, controllers, helpers: convert old-style
	 * 		// implementations by adding an export statement
	 * 		addModuleExport: true,
	 * 		//exlude model implementations, and do not include JSON grammar resources
	 * 		exclude: ['models', 'settings/grammar']
	 * 	},
	 * 	//utilize jQuery in mmir instead of (less backwards compatible)
	 * 	// alternative implementations (npm package jquery needs to be installed!)
	 * 	jquery: true,
	 * 	//specify language for runtime configuration (== configuration.json)
	 * 	configuration: {language: 'en'},
	 * 	//do include controller implementation found within resourcesPath
	 * 	// (NOTE: this is the default behavior)
	 * 	controllers: true,
	 * 	//do NOT include helper implemenations found within resourcesPath
	 * 	helpers: false,
	 * 	//...
	 * }
	 * ```
	 */
	export interface WebpackAppConfig extends AppConfig {

		/** specifying additional (or replacing) module paths */
		paths?: ModulePaths;

		/**
		 * disable logging in mmir runtime:
		 * suppresses all logging-output by replacing mmirf/logger with an empty logger implementation
		 */
		disableLogging?: boolean;

		/**
		 * include a (optional) module, e.g. will be available via
		 * <code>mmir.require()</code>.
		 *
		 * The prefix "mmirf/" can be omitted.
		 *
		 * @example
		 * ```
		 * includeModules: ['jsccGen', 'mmirf/jisonGen'],
		 * ```
		 */
		includeModules?: Array<ModuleId>;
		/**
		 * include module AND do load it BEFORE initializing the mmir library;
		 * the module will also be available via <code>mmir.require()</code>.
		 *
		 * The prefix "mmirf/" can be omitted.
		 *
		 * @example
		 * loadBeforeInit: ['mmirf/polyfill'],
		 */
		loadBeforeInit?: Array<ModuleId>;
		/**
		 * include module AND do load it AFTER initializing the mmir library;
		 * the module will also be available via <code>mmir.require()</code>.
		 *
		 * The prefix "mmirf/" can be omitted.
		 *
		 * @example
		 * ```
		 * loadAfterInit: ['mmirf/grammar/testing'],
		 * ```
		 */
		loadAfterInit?: Array<ModuleId>;

		/**
		 * Configuration for mmir modules (analogous to requirejs' module config entries)
		 */
		config?: ModuleConfigOptions;

		/**
		 * If `jquery` is included:
		 * `mmir` will automatically use `jquery` utililities instead of alternative
		 * implementations.
		 *
		 * NOTE: the `jquery` library must be loaded/included separately; this will
		 *       only configure `mmir` to use `jquery`, but not include the library itself.
		 */
		jquery?: boolean;

		/**
		 * Specify and configure mmir-plugins that should be included.
		 */
		includePlugins?: Array<PluginOptions>;

		/**
		 * Specify how (mmir) controller implementations should be parsed/included,
		 * and/or specify additional controllers that should be included.
		 *
		 * If `false`, (mmir) controllers will be excluded/ignored.
		 */
		controllers?: ControllerOptions | boolean;
		/**
		 * Specify how (mmir) helper implementations (for mmir controllers)
		 * should be parsed/included, and/or specify additional helpers that
		 * should be included.
		 *
		 * If `false`, helpers will be excluded/ignored.
		 */
		helpers?: HelperOptions | boolean;
		/**
		 * Specify how (mmir) data model implementations should be parsed/included,
		 * and/or specify additional data models that should be included.
		 *
		 * If `false`, data models will be excluded/ignored.
		 */
		models?: ModelOptions | boolean;

		/** configuration for webpack plugins (for internal use) */
		webpackPlugins?: any[];
	}

}
