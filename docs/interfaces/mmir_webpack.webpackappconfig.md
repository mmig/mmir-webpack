[mmir-webpack 6.0.0](../README.md) › [mmir-webpack](../modules/mmir_webpack.md) › [WebpackAppConfig](mmir_webpack.webpackappconfig.md)

# Interface: WebpackAppConfig

**`example`** 
```
var appConfig = {
	//path to directory that contains classic mmir directory structure
	resourcesPath: 'src/mmir',
	resourcesPathOptions: {
		//for included models, controllers, helpers: convert old-style
		// implementations by adding an export statement
		addModuleExport: true,
		//exlude model implementations, and do not include JSON grammar resources
		exclude: ['models', 'settings/grammar']
	},
	//utilize jQuery in mmir instead of (less backwards compatible)
	// alternative implementations (npm package jquery needs to be installed!)
	jquery: true,
	//specify language for runtime configuration (== configuration.json)
	configuration: {language: 'en'},
	//do include controller implementation found within resourcesPath
	// (NOTE: this is the default behavior)
	controllers: true,
	//do NOT include helper implemenations found within resourcesPath
	helpers: false,
	//...
}
```

## Hierarchy

* [AppConfig](mmir_tooling.appconfig.md)

  ↳ **WebpackAppConfig**

## Index

### Properties

* [config](mmir_webpack.webpackappconfig.md#optional-config)
* [configuration](mmir_webpack.webpackappconfig.md#optional-configuration)
* [controllers](mmir_webpack.webpackappconfig.md#optional-controllers)
* [disableLogging](mmir_webpack.webpackappconfig.md#optional-disablelogging)
* [grammars](mmir_webpack.webpackappconfig.md#optional-grammars)
* [helpers](mmir_webpack.webpackappconfig.md#optional-helpers)
* [includeModules](mmir_webpack.webpackappconfig.md#optional-includemodules)
* [includePlugins](mmir_webpack.webpackappconfig.md#optional-includeplugins)
* [jquery](mmir_webpack.webpackappconfig.md#optional-jquery)
* [loadAfterInit](mmir_webpack.webpackappconfig.md#optional-loadafterinit)
* [loadBeforeInit](mmir_webpack.webpackappconfig.md#optional-loadbeforeinit)
* [models](mmir_webpack.webpackappconfig.md#optional-models)
* [paths](mmir_webpack.webpackappconfig.md#optional-paths)
* [resourcesPath](mmir_webpack.webpackappconfig.md#optional-resourcespath)
* [resourcesPathOptions](mmir_webpack.webpackappconfig.md#optional-resourcespathoptions)
* [rootPath](mmir_webpack.webpackappconfig.md#optional-rootpath)
* [settings](mmir_webpack.webpackappconfig.md#optional-settings)
* [states](mmir_webpack.webpackappconfig.md#optional-states)
* [views](mmir_webpack.webpackappconfig.md#optional-views)
* [webpackPlugins](mmir_webpack.webpackappconfig.md#optional-webpackplugins)

## Properties

### `Optional` config

• **config**? : *[ModuleConfigOptions](../modules/mmir_tooling.md#moduleconfigoptions)*

Configuration for mmir modules (analogous to requirejs' module config entries)

___

### `Optional` configuration

• **configuration**? : *[RuntimeConfiguration](mmir_tooling.runtimeconfiguration.md)*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[configuration](mmir_tooling.appconfig.md#optional-configuration)*

Specify additional (mmir) runtime configuration values,
e.g. in addition to `config/configuration.json`.

In case of conflicts, these settings will override settings in
`config/configuration.json`,

___

### `Optional` controllers

• **controllers**? : *[ControllerOptions](mmir_tooling.controlleroptions.md) | boolean*

Specify how (mmir) controller implementations should be parsed/included,
and/or specify additional controllers that should be included.

If `false`, (mmir) controllers will be excluded/ignored.

___

### `Optional` disableLogging

• **disableLogging**? : *boolean*

disable logging in mmir runtime:
suppresses all logging-output by replacing mmirf/logger with an empty logger implementation

___

### `Optional` grammars

• **grammars**? : *[GrammarOptions](mmir_tooling.grammaroptions.md) | boolean*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[grammars](mmir_tooling.appconfig.md#optional-grammars)*

Specify how (JSON) grammars should be parsed/included, and/or
specify additional grammars that should be included.

Compiled grammars will be available via the [SemanticInterpreter](mmir_lib.semanticinterpreter.md).

If `false`, grammars will be excluded/ignored.

___

### `Optional` helpers

• **helpers**? : *[HelperOptions](mmir_tooling.helperoptions.md) | boolean*

Specify how (mmir) helper implementations (for mmir controllers)
should be parsed/included, and/or specify additional helpers that
should be included.

If `false`, helpers will be excluded/ignored.

___

### `Optional` includeModules

• **includeModules**? : *Array‹[ModuleId](../modules/mmir_tooling.md#moduleid)›*

include a (optional) module, e.g. will be available via
<code>mmir.require()</code>.

The prefix "mmirf/" can be omitted.

**`example`** 
```
includeModules: ['jsccGen', 'mmirf/jisonGen'],
```

___

### `Optional` includePlugins

• **includePlugins**? : *Array‹[PluginOptions](mmir_tooling.pluginoptions.md)›*

Specify and configure mmir-plugins that should be included.

___

### `Optional` jquery

• **jquery**? : *boolean*

If `jquery` is included:
`mmir` will automatically use `jquery` utililities instead of alternative
implementations.

NOTE: the `jquery` library must be loaded/included separately; this will
      only configure `mmir` to use `jquery`, but not include the library itself.

___

### `Optional` loadAfterInit

• **loadAfterInit**? : *Array‹[ModuleId](../modules/mmir_tooling.md#moduleid)›*

include module AND do load it AFTER initializing the mmir library;
the module will also be available via <code>mmir.require()</code>.

The prefix "mmirf/" can be omitted.

**`example`** 
```
loadAfterInit: ['mmirf/grammar/testing'],
```

___

### `Optional` loadBeforeInit

• **loadBeforeInit**? : *Array‹[ModuleId](../modules/mmir_tooling.md#moduleid)›*

include module AND do load it BEFORE initializing the mmir library;
the module will also be available via <code>mmir.require()</code>.

The prefix "mmirf/" can be omitted.

**`example`** 
loadBeforeInit: ['mmirf/polyfill'],

___

### `Optional` models

• **models**? : *[ModelOptions](mmir_tooling.modeloptions.md) | boolean*

Specify how (mmir) data model implementations should be parsed/included,
and/or specify additional data models that should be included.

If `false`, data models will be excluded/ignored.

___

### `Optional` paths

• **paths**? : *[ModulePaths](../modules/mmir_tooling.md#modulepaths)*

specifying additional (or replacing) module paths

___

### `Optional` resourcesPath

• **resourcesPath**? : *string*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[resourcesPath](mmir_tooling.appconfig.md#optional-resourcespath)*

specify the path to the MMIR resources directory with the default structure:
 ```bash
 config/
       /languages/
                 /<lang>/
                        /grammar.json
                        /dictionary.json
                        /speech.json
       /states/
              /input.xml
              /dialog.xml
       /configuration.json
 controllers/*
 helpers/*
 models/*
 views/*
 ```

The path will be used to collect all available resources and create the correspondig
options for including them.

**`default`** "www"

___

### `Optional` resourcesPathOptions

• **resourcesPathOptions**? : *[ResourcesOptions](mmir_tooling.resourcesoptions.md)*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[resourcesPathOptions](mmir_tooling.appconfig.md#optional-resourcespathoptions)*

___

### `Optional` rootPath

• **rootPath**? : *string*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[rootPath](mmir_tooling.appconfig.md#optional-rootpath)*

used for resolving non-absolute paths: the absolute path to the app's root/sources directory (if omitted the current working directory is used for resolving non-absolute paths)

___

### `Optional` settings

• **settings**? : *[SettingsOptions](mmir_tooling.settingsoptions.md) | boolean*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[settings](mmir_tooling.appconfig.md#optional-settings)*

Specify how (mmir) configuration and settings should be parsed/included,
and/or specify additional settings that should be included.

The `mmir` configuration/settings are the resources that are by default
located in the mmir `config/` directory
(with exception of the `states` sub-directory; for those instead use [WebpackAppConfig.states](mmir_webpack.webpackappconfig.md#optional-states)):
 ```bash
 config/
       /languages/
                 /<lang>/
                        /grammar.json
                        /dictionary.json
                        /speech.json
       /states/
              /input.xml
              /dialog.xml
       /configuration.json
```
(NOTE the `config/states/` sub-directory is handled/configured via the the [states](mmir_webpack.webpackappconfig.md#optional-states) option)

___

### `Optional` states

• **states**? : *[StateOptions](mmir_tooling.stateoptions.md) | boolean*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[states](mmir_tooling.appconfig.md#optional-states)*

Specify how (SCXML) state-machines/-models should be parsed/included, and/or
specify additional state-models that should be included.

If `false`, state-models will be excluded/ignored.

By default, if no state-models are include, "minimal" state-models
for the [InputManager](mmir_lib.inputmanager.md) and the [DialogManager](mmir_lib.dialogmanager.md) will be included,
see [mmir-tooling/defaultValues](https://github.com/mmig/mmir-tooling/tree/master/defaultValues).

___

### `Optional` views

• **views**? : *[ViewOptions](mmir_tooling.viewoptions.md) | boolean*

*Inherited from [AppConfig](mmir_tooling.appconfig.md).[views](mmir_tooling.appconfig.md#optional-views)*

Specify how (mmir) views should be parsed/included, and/or
specify additional views that should be included.

If `false`, views will be excluded/ignored.

___

### `Optional` webpackPlugins

• **webpackPlugins**? : *any[]*

configuration for webpack plugins (for internal use)
