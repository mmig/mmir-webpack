**[mmir-webpack 7.0.0-beta1](../README.md)**

> [Globals](../README.md) / mmir-webpack

# Namespace: mmir-webpack

`mmir-webpack` integrates `mmir-lib` into _webpack_-built apps:

include `mmir-lib`, configure _mmir_, include/compile/generate _mmir_ resources
(e.g. grammars, state-models), _mmir_-plugins, ...

**`module`** mmir-webpack

## Callable

▸ **mmirWebpackFunc**(`webpackInstance`: *typeof* webpack, `webpackConfig`: WebpackConfiguration, `mmirWebpackConfig`: [WebpackAppConfig](../interfaces/mmir_webpack.webpackappconfig.md)): WebpackConfiguration

apply the `mmirWebpackConfig` configuration the (existing) _webpack_
configuration `webpackConfig`.

include `mmir-lib`, configure _mmir_, include/compile/generate _mmir_ resources
(e.g. grammars, state-models), _mmir_-plugins, ...

**`module`** mmir-webpack

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`webpackInstance` | *typeof* webpack | the _webpack_ instance, i.e. `require('webpack')` (supports _webpack_ versions 3.x - 4.x)  |
`webpackConfig` | WebpackConfiguration | the (existing) _webpack_ configuration for the app: will be extended/modified with _mmir_                _webpack_ configuration\                 NOTE this (modified) object will also be returned by this function, i.e. it is an INOUT parameter  |
`mmirWebpackConfig` | [WebpackAppConfig](../interfaces/mmir_webpack.webpackappconfig.md) | the _mmir_ configuration  |

**Returns:** WebpackConfiguration

the modified (paramater) `webpackConfig`

## Index

### Type aliases

* [WebpackAppConfig](mmir_webpack.md#webpackappconfig)
* [WebpackModule](mmir_webpack.md#webpackmodule)
* [WebpackModuleConfiguration](mmir_webpack.md#webpackmoduleconfiguration)
* [WebpackRule](mmir_webpack.md#webpackrule)

## Type aliases

### WebpackAppConfig

Ƭ  **WebpackAppConfig**: \_WebpackAppConfig

___

### WebpackModule

Ƭ  **WebpackModule**: *typeof* webpack

___

### WebpackModuleConfiguration

Ƭ  **WebpackModuleConfiguration**: WebpackConfiguration

___

### WebpackRule

Ƭ  **WebpackRule**: WebpackRuleSet
