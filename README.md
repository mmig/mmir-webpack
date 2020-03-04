[mmir-webpack][0]
==============

[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/mmig/mmir-webpack/master)](https://github.com/mmig/mmir-webpack)
[![npm](https://img.shields.io/npm/v/mmir-webpack)](https://www.npmjs.com/package/mmir-webpack)
[![API](https://img.shields.io/badge/docs-API%20reference-orange.svg?style=flat)](https://mmig.github.io/mmir/api)
[![Guides](https://img.shields.io/badge/docs-guides-orange.svg?style=flat)](https://github.com/mmig/mmir/wiki)

Integration for [mmir][1] in [webpack][3] built apps.

Basic steps for integrating [mmir][1]:

 * install [mmir-lib][1] via `npm`
 * install [mmir-webpack][0] via `npm`
 * create or use existing `webpack` configuration where `mmir-webpack`
   configures/extends the app's base webpack-configuration for `mmir`, similar to
   ```javascript
   //const webpackInstance = require('webpack');
   require('mmir-webpack')(webpackInstance, origWebpackConfig, mmirWebpackConfig)
   ```

# Prerequisites

 * Node.js
 * `webpack` built application with `webpack` version 3.x - 4.x
  * `webpack` plugins: _(may need to be installed, see instructions below)_
    ```json
    "file-loader": ">=4.3.0",
    "raw-loader": ">=3.1.0",
    "virtual-module-webpack-plugin": ">=0.4.1",
    "val-loader": ">=1.1.1",
    "worker-loader": ">=2.0.0"
    ```

### Installation

Install `mmir-webpack` via `npm`.

From `npm` registry
```bash
npm install mmir-webpack
```

Or latest development version from _github_
```bash
npm install git+https://github.com/mmig/mmir-webpack.git
```

In addition, some `webpack` plugins are required:  
if not already installed _(see npm log output regarding peer/OPTIONAL dependencies
during installation of `mmir-webpack`)_, they can be installed with
```bash
npm install file-loader raw-loader val-loader worker-loader virtual-module-webpack-plugin
```
_Or, for older `webpack` versions, see the corresponding documentation for the
plugin for installing the appropriate plugin package version(s), using
`npm install <package>@<required version>`_

# API Documentation

See generated [API documentation][4] (or more detailed [HTML][5] documentation) and details below.


# Example

The base webpack configuration is in `/app-webpack.config.js`:  
start/configure `webpack` build to use configuration `/webpack.config.js` --
this webpack build configuration should load the app's webpack configuration
and adds its `mmir` configuration, e.g. something similar to

```javascript
const path = require('path');
const webpack = require('webpack');

const appWebpackConfig = require('./app-webpack.config');

//NOTE the following assumes that appWebpackConfig is a single webpack-configuration object

//this assumes that the mmir resources are included in the standard directory
// structure in src/app/mmir/** (see docs for more details/options)
const mmirWebpackConfig = {
  resourcesPath: path.join(__dirname, 'src/app/mmir')
};

require('mmir-webpack')(webpack, appWebpackConfig, mmirWebpackConfig);

module.exports = appWebpackConfig;

```

or an example for replacing / extending / overwriting runtime configuration settings
of `mmir` that would usually be made in the `<src-app-mmir>/config/configuration.json` file:
```javascript
...

// specify some runtime configuration settings for mmir:
const runtimeConfig = {
  language: 'de',              // this will set or overwrite language setting in configuration.json (see docs for RuntimeConfiguration)
  grammarAsyncExecMode: true   // load grammars for async-execution in web workers (see docs for RuntimeConfiguration)
};

...

//set the runtime configuration in the mmir webpack options & apply them:
const mmirWebpackConfig = {
  ...
  configuration: runtimeConfig
};

require('mmir-webpack')(webpack, appWebpackConfig, mmirWebpackConfig);

module.exports = appWebpackConfig;

```

See also file [webpack.config.js](./webpack.config.js) for more examples.

# Versioning Note

The major and minor version number of `mmir-webpack` matches the compatible
verison of `mmir-lib`, i.e. `mmir-webpack X.Y.i` is compatible with `mmir-lib X.Y.j`.

----

[0]: https://github.com/mmig/mmir-webpack
[1]: https://github.com/mmig/mmir-lib
[2]: https://github.com/mmig/mmir-tooling
[3]: https://webpack.js.org/
[4]: https://github.com/mmig/mmir-webpack/tree/master/docs/modules
[5]: https://mmig.github.io/mmir/api-ts/modules/mmir_webpack.html
