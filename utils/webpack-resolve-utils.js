"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResolveAlias = exports.expandPackageResources = exports.addAliasFrom = exports.setAliasEntry = exports.toExactAliasId = exports.isExactAliasEntry = exports.getAliasEntry = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const type_utils_1 = require("mmir-tooling/tools/type-utils");
const log_utils_1 = require("mmir-tooling/utils/log-utils");
const filepath_utils_1 = __importDefault(require("mmir-tooling/utils/filepath-utils"));
const webpack_resources_config_1 = __importDefault(require("../webpack-resources-config"));
function isExistingDirectory(absPath) {
    return fs_1.existsSync(absPath) && filepath_utils_1.default.isDirectory(absPath);
}
/**
 * get entry for (webpack) alias entry
 *
 * NOTE webpack aliases may have suffix $ which indicates that the alias must match exactly (i.e. is not part of the ID itself!)
 *
 *
 * @param  aliasId the ID to look up in the alias map
 * @param  aliasMap the webpack alias map
 * @return the alias entry (i.e. file/directory path) or undefined, if there is no entry
 *
 * @see https://webpack.js.org/configuration/resolve/#resolvealias
 */
function getAliasEntry(aliasId, aliasMap) {
    // NOTE webpack aliases may have suffix $ which indicates that the alias must match exactly (i.e. is not part of the ID itself!)
    return aliasMap[aliasId + '$'] || aliasMap[aliasId];
}
exports.getAliasEntry = getAliasEntry;
/**
 * check if the alias entry is an exact-match entry in the alias mapping
 *
 * NOTE if there is no entry in the `aliasMap`, this function always returns `false`
 *
 * @param  aliasId the ID
 * @param  aliasMap the webpack alias map
 * @return `true` if the ID is an extact-match lookup ID (for webpack resolve alias mapping)
 *
 * @see https://webpack.js.org/configuration/resolve/#resolvealias
 */
function isExactAliasEntry(aliasId, aliasMap) {
    if (aliasId && aliasMap[aliasId])
        return aliasId[aliasId.length - 1] === '$';
    return false;
}
exports.isExactAliasEntry = isExactAliasEntry;
/**
 * convert an ID to an exact-match alias entry (for webpack resolve aliases)
 *
 * @param  moduleId the ID
 * @return the alias ID for exact-matching
 */
function toExactAliasId(moduleId) {
    // add suffix $ to indicated to webpack that this alias entry must match extactly (i.e. must not be expanded)
    if (!moduleId) {
        log_utils_1.warn('resolve-utils: trying to convert empty or undefined module ID to alias entry ' + JSON.stringify(moduleId));
        return moduleId;
    }
    if (moduleId[moduleId.length - 1] === '$') {
        return moduleId;
    }
    return moduleId + '$';
}
exports.toExactAliasId = toExactAliasId;
/**
 * HELPER set an (webpack) alias entry, either as an "exact-matching" entry, or as an in-exact entry (i.e. can be expanded by webpack)
 *
 * NOTE: if `alias` already contains an entry (either as exact match or in-exact match), then the existing entry is overwritten
 *
 * @param aliasId the module ID (should not end with '$')
 * @param aliasEntry the entry for the to be written to the alias map
 * @param aliasMap the alias mapping
 * @param isPreferExact if `true`, the entry is tried as an exact match, if `false` as an in-exact match
 *                      (but if an entry for the ID already exists, either as exact or as in-exact match, the existing entry is overwritten)
 */
function setAliasEntry(aliasId, aliasEntry, aliasMap, isPreferExact) {
    let id = toExactAliasId(aliasId);
    if (isPreferExact) {
        if (aliasMap[aliasId]) {
            // if prefer exact, but there is already an in-exact entry: do override the in-exact one
            id = aliasId;
        }
    }
    else {
        if (!aliasMap[id]) {
            // if prefer in-exact: only use in-exact one, if there is no entry yet for an exact one (i.e. if there is alredy an exact entry, do overwrite that with the new entry)
            id = aliasId;
        }
    }
    aliasMap[id] = aliasEntry;
}
exports.setAliasEntry = setAliasEntry;
/**
 * add/overwrite module alias (i.e. mapping module ID to file path)
 *
 * @param  {{paths?: {[moduleId: string]: string}}} mmirAppConfig the app-specific configuration: applies module-path-specifications from mmirAppConfig.paths
 * @param  {[{[moduleId: string]: string}]} alias the (default) mapping of module IDs to (absolute) paths
 * @returns a list of alias entries that should be in-exact (i.e. can be expanded by webpack alias resolver)
 */
function addAliasFrom(mmirAppConfig, alias) {
    if (type_utils_1.isWebpackConfig(mmirAppConfig)) {
        // log('adding/overwriting paths with app paths: ', mmirAppConfig.paths);
        const appRoot = mmirAppConfig.rootPath || process.cwd();
        const hasPackages = Array.isArray(mmirAppConfig.packages);
        const packageIds = hasPackages ? new Set(mmirAppConfig.packages.map(item => item.name)) : null;
        const inexactEntries = [];
        let p, isAbs, absPath;
        for (let n in mmirAppConfig.paths) {
            p = mmirAppConfig.paths[n];
            isAbs = path_1.isAbsolute(p);
            absPath = isAbs ? p : path_1.join(appRoot, p);
            // do not add entries for package-definitions:
            // the resolved files of the package-defition will be added later (see below)
            if ((!hasPackages || !packageIds.has(n)) && !isExistingDirectory(absPath)) {
                // NOTE for package-entries (i.e. directories) and entries with absolute paths (most likely user defined entries),
                //      do not create "extact match entry", i.e. those may get expanded by webpack when resolving
                // ... but do this only, if there is not already an exact-match entry: if there is one, do replace the exact-match entry
                setAliasEntry(n, absPath, alias, false);
            }
            else {
                inexactEntries.push({ aliasId: n, absolutePath: absPath });
            }
        }
        if (hasPackages) {
            expandPackageResources(appRoot, alias, mmirAppConfig.packages);
        }
        return inexactEntries;
    }
    //DISABLED redirection must be handled by NormalModuleReplacementPlugin, because loadFile is not directly require'ed, but vie package (sub) path 'mmirf/util'
    // //add "proxy" for mmirf/util/loadFile, so that inlined resouces get returned directly:
    // alias['mmirf/util/loadFile$'] = path.resolve('./runtime/webpack-loadFile.js');
    // var origLoadFile = path.resolve(alias['mmirf/util'], 'loadFile.js');
    // alias['mmirf/util/loadFile__raw$'] = origLoadFile;
}
exports.addAliasFrom = addAliasFrom;
/**
 *	expand require.js package definitions & add them to the alias dictionary
 *
 * NOTE: this is not needed by webpacks module resolver (i.e. to find modules within the package definition), but
 *       it is need for preserving the module IDs within the package, i.e. for use of `mmir.require(<module within the package>)`
 *
 * TODO extract this function to mmir-tooling?
 *
 * @param  {string} rootDir the mmir root dir (usually node_modules/mmir-lib/lib/ )
 * @param  {{[id: string]: string}} alias dictionary for module ID/alias -> module-path (INOUT parameter)
 * @param  {Array<{name: string, location: string}>} resourcesConfigPackages list of require.js package definitions
 */
function expandPackageResources(rootDir, alias, resourcesConfigPackages) {
    var getFiles = function (dir, relDir, baseId) {
        var files = fs_1.readdirSync(dir);
        files.forEach(function (f) {
            var absPath = path_1.join(dir, f);
            var relPath = relDir ? path_1.join(relDir, f) : f;
            if (filepath_utils_1.default.isDirectory(absPath)) {
                getFiles(dir, relPath);
            }
            else {
                //create id for file/module (without file-extension):
                var fid = filepath_utils_1.default.normalizePath(path_1.join(baseId, path_1.basename(relPath, path_1.extname(relPath))));
                setAliasEntry(fid, absPath, alias, true);
                // console.log('  added package module ', fid, ' -> ', absPath);
            }
        });
    };
    // list: Array<{name: string, location: string}>
    resourcesConfigPackages.forEach(function (p) {
        getFiles(path_1.join(rootDir, p.location), '', p.name);
    });
}
exports.expandPackageResources = expandPackageResources;
function createResolveAlias(mmirAppConfig, mmirLibRootDir, webpackRootDir) {
    var paths = webpack_resources_config_1.default.paths;
    const hasPackages = Array.isArray(webpack_resources_config_1.default.packages);
    const packageIds = hasPackages ? new Set(webpack_resources_config_1.default.packages.map(item => item.name)) : null;
    const inexactEntries = [];
    var alias = {}, p;
    for (var n in paths) {
        p = paths[n];
        if (/^build-tool\//.test(n)) {
            setAliasEntry(n, path_1.isAbsolute(p) ? p : path_1.join(webpackRootDir, p), alias, true);
        }
        else {
            const isAbs = path_1.isAbsolute(p);
            const absPath = isAbs ? p : path_1.join(mmirLibRootDir, p);
            // do not add entries for package-definitions:
            // the resolved files of the package-defition will be added later (see below)
            if (!hasPackages || !packageIds.has(n)) {
                // NOTE for package-entries (i.e. directories) and entries with absolute paths (most likely user defined entries),
                //      do not create "extact match entry", i.e. those may get expanded by webpack when resolving
                // ... but do this only, if there is not already an exact-match entry: if there is one, do replace the exact-match entry
                setAliasEntry(n, absPath, alias, !isExistingDirectory(absPath));
            }
            else if (hasPackages) {
                inexactEntries.push({ aliasId: n, absolutePath: absPath });
            }
        }
    }
    if (hasPackages) {
        expandPackageResources(mmirLibRootDir, alias, webpack_resources_config_1.default.packages);
    }
    const additionalInexactEntries = addAliasFrom(mmirAppConfig, alias);
    if (additionalInexactEntries) {
        for (const pe of additionalInexactEntries) {
            inexactEntries.push(pe);
        }
    }
    if (mmirAppConfig.disableLogging) {
        setAliasEntry('mmirf/logger', getAliasEntry('mmirf/loggerDisabled', alias), alias, true);
    }
    // do add inexact alias entries (e.g. for packages) lastly
    // (i.e. entries that may get expanded by webpack)
    if (inexactEntries.length > 0) {
        for (const pe of inexactEntries) {
            setAliasEntry(pe.aliasId, pe.absolutePath, alias, false);
        }
    }
    return alias;
}
exports.createResolveAlias = createResolveAlias;
