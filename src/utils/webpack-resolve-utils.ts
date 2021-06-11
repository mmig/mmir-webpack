
import { isAbsolute, join, basename, extname } from 'path';
import { readdirSync, existsSync } from 'fs';

import { AppConfig , BuildAppConfig, WebpackAppConfig } from 'mmir-tooling';
import { isWebpackConfig } from 'mmir-tooling/tools/type-utils';

import { warn } from 'mmir-tooling/utils/log-utils';

import fileUtils from  'mmir-tooling/utils/filepath-utils';
import resourcesConfig from '../webpack-resources-config';

function isExistingDirectory(absPath: string): boolean {
    return existsSync(absPath) && fileUtils.isDirectory(absPath);
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
export function getAliasEntry(aliasId: string, aliasMap: {[id: string]: string}): string | undefined {
    // NOTE webpack aliases may have suffix $ which indicates that the alias must match exactly (i.e. is not part of the ID itself!)
    return aliasMap[aliasId + '$'] || aliasMap[aliasId];
}

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
export function isExactAliasEntry(aliasId: string, aliasMap: {[id: string]: string}): boolean {
    if (aliasId && aliasMap[aliasId])
        return aliasId[aliasId.length-1] === '$';
    return false;
}

/**
 * convert an ID to an exact-match alias entry (for webpack resolve aliases)
 *
 * @param  moduleId the ID
 * @return the alias ID for exact-matching
 */
export function toExactAliasId(moduleId: string): string {
    // add suffix $ to indicated to webpack that this alias entry must match extactly (i.e. must not be expanded)
    if(!moduleId){
        warn('resolve-utils: trying to convert empty or undefined module ID to alias entry '+JSON.stringify(moduleId));
        return moduleId;
    }

    if(moduleId[moduleId.length-1] === '$'){
        return moduleId;
    }

    return moduleId + '$';
}

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
export function setAliasEntry(aliasId: string, aliasEntry: string, aliasMap: {[id: string]: string}, isPreferExact: boolean): void {
    let id: string = toExactAliasId(aliasId);
    if(isPreferExact){
        if(aliasMap[aliasId]){
            // if prefer exact, but there is already an in-exact entry: do override the in-exact one
            id = aliasId;
        }
    } else {
        if(!aliasMap[id]){
            // if prefer in-exact: only use in-exact one, if there is no entry yet for an exact one (i.e. if there is alredy an exact entry, do overwrite that with the new entry)
            id = aliasId;
        }
    }
    aliasMap[id] = aliasEntry;
}

/**
 * add/overwrite module alias (i.e. mapping module ID to file path)
 *
 * @param  {{paths?: {[moduleId: string]: string}}} mmirAppConfig the app-specific configuration: applies module-path-specifications from mmirAppConfig.paths
 * @param  {[{[moduleId: string]: string}]} alias the (default) mapping of module IDs to (absolute) paths
 */
export function addAliasFrom(mmirAppConfig: AppConfig | BuildAppConfig | WebpackAppConfig, alias: {[moduleId: string]: string}): void {

    if(isWebpackConfig(mmirAppConfig)){
        // log('adding/overwriting paths with app paths: ', mmirAppConfig.paths);
        // Object.assign(alias, mmirAppConfig.paths);
        const appRoot = mmirAppConfig.rootPath || process.cwd();
        let p: string, isAbs: boolean, absPath: string;
        for (let n in mmirAppConfig.paths) {
            p = mmirAppConfig.paths[n];
            isAbs = isAbsolute(p);
            // NOTE for package-entries (i.e. directories) and entries with absolute paths (most likely user defined entries),
            //      do not create "extact match entry", i.e. those may get expanded by webpack when resolving
            // ... but do this only, if there is not already an exact-match entry: if there is one, do replace the exact-match entry
            absPath = isAbs? p : join(appRoot, p);
            setAliasEntry(n, absPath, alias, !isExistingDirectory(absPath));
        }
        // log('set paths to -> ', alias);
    }

    //DISABLED redirection must be handled by NormalModuleReplacementPlugin, because loadFile is not directly require'ed, but vie package (sub) path 'mmirf/util'
    // //add "proxy" for mmirf/util/loadFile, so that inlined resouces get returned directly:
    // alias['mmirf/util/loadFile$'] = path.resolve('./runtime/webpack-loadFile.js');
    // var origLoadFile = path.resolve(alias['mmirf/util'], 'loadFile.js');
    // alias['mmirf/util/loadFile__raw$'] = origLoadFile;
}


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
export function expandPackageResources(rootDir: string, alias: {[id: string]: string}, resourcesConfigPackages: {name: string, location: string}[]){

    var getFiles = function(dir: string, relDir: string, baseId?: string): void {
        var files = readdirSync(dir);
        files.forEach(function(f){
            var absPath = join(dir, f);
            var relPath = relDir? join(relDir, f) : f;
            if(fileUtils.isDirectory(absPath)){
                getFiles(dir, relPath);
            } else {
                //create id for file/module (without file-extension):
                var fid = fileUtils.normalizePath(join(baseId, basename(relPath, extname(relPath))));
                setAliasEntry(fid, absPath, alias, true);
                // console.log('  added package module ', fid, ' -> ', absPath);
            }
        });
    };

    // list: Array<{name: string, location: string}>
    resourcesConfigPackages.forEach(function(p: &{location: string, name: string}){
        getFiles(join(rootDir, p.location), '', p.name);
    });

}

export function createResolveAlias(mmirAppConfig: WebpackAppConfig, mmirLibRootDir: string, webpackRootDir: string): {[id: string]: string} {

    var paths = resourcesConfig.paths;

    const hasPackages = Array.isArray(resourcesConfig.packages);
    const packageIds = hasPackages? new Set<string>(resourcesConfig.packages.map(item => item.name)) : null;

    var alias = {}, p: string;
    for (var n in paths) {
        p = paths[n];
        if(/^build-tool\//.test(n)){
            setAliasEntry(n, isAbsolute(p)? p : join(webpackRootDir, p), alias, true);
        } else {
            const isAbs = isAbsolute(p);
            const isPackage = !isAbs && hasPackages && packageIds.has(n);
            const absPath = isAbs? p : join(mmirLibRootDir, p);
            // NOTE for package-entries (i.e. directories) and entries with absolute paths (most likely user defined entries),
            //      do not create "extact match entry", i.e. those may get expanded by webpack when resolving
            // ... but do this only, if there is not already an exact-match entry: if there is one, do replace the exact-match entry
            setAliasEntry(n, absPath, alias, !isPackage && !isExistingDirectory(absPath));
        }
    }

    if(hasPackages){
        expandPackageResources(mmirLibRootDir, alias, resourcesConfig.packages);
    }

    addAliasFrom(mmirAppConfig, alias);

    if(mmirAppConfig.disableLogging){
        setAliasEntry('mmirf/logger', getAliasEntry('mmirf/loggerDisabled', alias), alias, true);
    }

    return alias;
}
