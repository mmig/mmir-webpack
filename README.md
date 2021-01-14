[mmir-webpack][0]
==============

[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/mmig/mmir-webpack/master)](https://github.com/mmig/mmir-webpack)
[![npm](https://img.shields.io/npm/v/mmir-webpack)](https://www.npmjs.com/package/mmir-webpack)
[![API MD](https://img.shields.io/badge/docs%40master-API%20quick%20reference-orange.svg?style=flat)](https://github.com/mmig/mmir-webpack/tree/master/docs)
[![API](https://img.shields.io/badge/docs-API%20reference-orange.svg?style=flat)](https://mmig.github.io/mmir/api-ts)
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

__Overview__

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Example](#example)
	- [Integrating with `angular`](#integrating-with-angular)
- [Versioning Note](#versioning-note)

<!-- /TOC -->

# Prerequisites

 * Node.js
 * `webpack` built application with `webpack` version 3.x - 5.x
  * `webpack` plugins: _(may need to be installed, see instructions below)_
    ```json
    "file-loader": ">=3.0.0",
    "raw-loader": ">=3.0.0",
    "virtual-module-webpack-plugin": ">=0.4.1",
    "val-loader": ">=1.1.1",
    "worker-loader": ">=2.0.0"
    ```

# Installation

Install `mmir-webpack` via `npm`.

From `npm` registry
```bash
npm install -D mmir-webpack
```

Or latest development version from `github`
```bash
npm install -D git+https://github.com/mmig/mmir-webpack.git
```

In addition, some `webpack` plugins are required:  
if not already installed _(see npm log output regarding peer/OPTIONAL dependencies
during installation of `mmir-webpack`)_, they can be installed with
```bash
npm install -D file-loader raw-loader val-loader worker-loader virtual-module-webpack-plugin
```
_For older `webpack` versions, see the corresponding documentation for the
plugin for installing the appropriate plugin package version(s), using
`npm install <package>@<required version>`_

# API Documentation

See generated [API documentation][4] (or more detailed [HTML][5] documentation) and details below.


# Example

Assuming the base webpack configuration is in `/app-webpack.config.js`:  
then create the default-configuration file for the `webpack` build by  creating `/webpack.config.js` --
this webpack build configuration should load the app's base `webpack`
configuration and adds its `mmir` configuration, e.g. something similar to

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

## Integrating with `angular`

For integrating with [angular][6] Create the `mmir` build configuration in a file, e.g.
`/mmir-webpack.config.js` following instructions above, but
export as a _modifier function_:
```javascript
// ... some mmir-related configuration stored in variable mmirAppConfig, then:

const webpack = require('webpack');
//NOTE: do use function-modifiction in order to add mmir-config on top of angualar etc config
//      (otherwise, the automatic merging may interfere with mmir webpack config)
module.exports = function(webpackConfig, _options){
  try{
    require('mmir-webpack')(webpack, webpackConfig, mmirAppConfig);
  } catch(err){
    console.log(err);
    throw err;
  }
  return webpackConfig;
}
```

Then for integration with `angular`:

 1. setup the project to use the [custom-webpack][7] builder for `angular` by installing
    ```bash
    # for angular v7.x
    npm install -D @angular-builders/custom-webpack@7

    # for angular v8.x
    npm install -D @angular-builders/custom-webpack@8

    # for angular v9.x
    npm install -D @angular-builders/custom-webpack@9

    # for angular v10.x
    npm install -D @angular-builders/custom-webpack@10

    # for angular v11.x
    npm install -D @angular-builders/custom-webpack@11

    ```
 2. and starting with `angular` v8.x, for supporting iterative dev builds, `angular`'s custom [dev-server][8] with `webpack`-support
    ```bash
    npm install -D @angular-builders/dev-server
    ```

 3. modify the `angular` build configuration `/angular.json`:  
    1. find the option for `projects.app.architect.build.builder` and change it to `@angular-builders/custom-webpack:browser`, and add an entry to its `options` where `customWebpackConfig.path` points to the file with `mmir` webpack configuration:
       ```json
       {
         ...
         "architect": {
          "build": {
            "builder": "@angular-builders/custom-webpack:browser",
            "options": {
              "customWebpackConfig": {
                "path": "./mmir-webpack.config.js"
              },
          ...
        }}}}
       ```
    2. for supporting dev-builds, modify the entry for `projects.app.architect.serve.builder` to use `@angular-builders/custom-webpack:dev-server`:
       ```json
       {
         ...
         "serve": {
            "builder": "@angular-builders/custom-webpack:dev-server",
            "options": {
              "browserTarget": "app:build"
            },
         ...
       }}}}
       ```
       _(in case of `angular` v7.x, instead you may need to configure `serve` analogous to `build`, see above)_
    3. for `projects.app.architect.test` use similar modifications as for `build` (see above) while setting `builder` to `@angular-builders/custom-webpack:karma`


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
[6]: https://angular.io/
[7]: https://www.npmjs.com/package/@angular-builders/custom-webpack
[8]: https://www.npmjs.com/package/@angular-builders/dev-server
