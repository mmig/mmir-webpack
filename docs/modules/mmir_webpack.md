[mmir-webpack 6.1.0](../README.md) › [mmir-webpack](mmir_webpack.md)

# Module: mmir-webpack

`mmir-webpack` integrates `mmir-lib` into _webpack_-built apps:

include `mmir-lib`, configure _mmir_, include/compile/generate _mmir_ resources
(e.g. grammars, state-models), _mmir_-plugins, ...

**`module`** mmir-webpack

## Callable

▸ **mmirWebpackFunc**(`webpackInstance`: typeof webpack, `webpackConfig`: WebpackConfiguration, `mmirWebpackConfig`: [WebpackAppConfig](../interfaces/mmir_webpack.webpackappconfig.md)): *WebpackConfiguration*

apply the `mmirWebpackConfig` configuration the (existing) _webpack_
configuration `webpackConfig`.

include `mmir-lib`, configure _mmir_, include/compile/generate _mmir_ resources
(e.g. grammars, state-models), _mmir_-plugins, ...

**`module`** mmir-webpack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`webpackInstance` | typeof webpack | the _webpack_ instance, i.e. `require('webpack')` (supports _webpack_ versions 3.x - 4.x)  |
`webpackConfig` | WebpackConfiguration | the (existing) _webpack_ configuration for the app: will be extended/modified with _mmir_ 															_webpack_ configuration\ 									 						NOTE this (modified) object will also be returned by this function, i.e. it is an INOUT parameter  |
`mmirWebpackConfig` | [WebpackAppConfig](../interfaces/mmir_webpack.webpackappconfig.md) | the _mmir_ configuration  |

**Returns:** *WebpackConfiguration*

the modified (paramater) `webpackConfig`

## Index

### Interfaces

* [WebpackAppConfig](../interfaces/mmir_webpack.webpackappconfig.md)
