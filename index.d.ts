/// <reference types="mmir-lib" />
import 'mmir-lib';

import { AppConfig , ModulePaths, ModuleId, ModuleConfigOptions, SettingsOptions, RuntimeConfiguration, PluginOptions, ControllerOptions, HelperOptions, ModelOptions } from 'mmir-tooling';

declare function apply(webpackInstance: any, webpackConfig: any, mmirAppConfig: WebpackAppConfig): void;

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

	config?: ModuleConfigOptions;

	jquery?: boolean;
	settings?: SettingsOptions;
	configuration?: RuntimeConfiguration;

	includePlugins?: Array<PluginOptions>;

	controllers?: ControllerOptions | boolean;
	helpers?: HelperOptions | boolean;
	models?: ModelOptions | boolean;

	/** configuration for webpack plugins (for internal use) */
	webpackPlugins?: any[];
}
