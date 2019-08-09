[mmir-webpack][3]
========

[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![GitHub package.json version](https://img.shields.io/github/package-json/v/mmig/mmir-webpack)

Integration for [mmir][1] in [webpack][4] built apps.

Basic steps for integrating [mmir][1]:

 * install [mmir-lib][1] via `npm`
 * install [mmir-webpack][3] via `npm`
 * create or use existing `webpack` configuration where `mmir-webpack`
   configures/extends the apps base webpack-configuration for `mmir`, similar to
   ```
   require('mmir-webpack')(webpackInstance, origWebpackConfig, mmirWebpackConfig)
   ```

# Prerequisites

 * Node.js
 * `webpack` built application with `webpack` version 3.x - 4.x


### Installation

Install `mmir-webpack` via `npm`.


# API Documentation

See generated [API documentation][5] (or more detailed [HTML][6] documentation) and details below.


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

See also file [webpack.config.js](./webpack-config.js) as an example.


--

[1]: https://github.com/mmig/mmir-lib
[2]: https://github.com/mmig/mmir-tooling
[3]: https://github.com/mmig/mmir-webpack
[4]: https://webpack.js.org/
[5]: https://github.com/mmig/mmir-webpack/tree/master/docs/modules
[6]: https://mmig.github.io/mmir/api-ts/modules/mmir_webpack.html
