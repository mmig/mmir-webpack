"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceModuleIdPlugin = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const log_utils_1 = require("mmir-tooling/utils/log-utils");
const dir = __dirname;
const reNormalize = path_1.sep !== '/' ? new RegExp(path_1.sep.replace(/\\/g, '\\\\'), 'g') : null;
function idFromPath(path) {
    if (reNormalize) {
        path = path.replace(reNormalize, '/');
    }
    return path;
}
function lookUpAlias(aliasId, aliasMap) {
    // NOTE webpack aliases may have suffix $ which indicates that the alias must match exactly (i.e. is not part of the ID itself!)
    return aliasMap[aliasId + '$'] || aliasMap[aliasId];
}
const reCleanLookUpId = /\$$/;
function normalizeLookUpId(lookUpId) {
    // NOTE webpack aliases may have suffix $ which indicates that the alias must match exactly -> needs to be removed, since it is not part of the ID itself
    return lookUpId.replace(reCleanLookUpId, '');
}
/**
 * tries to find the (raw) module ID for a path (or the module's original ID)
 *
 * @param  modPaths the mapping for (raw) module IDs (i.e. webpack alias definitions) to file/directory paths
 * @param  path the path for which to find the (raw) module ID (if `undefined`, the `originalId` is used for finding the appropriate ID)
 * @param  fileExtensions the file extension (if there is any) of param `path`
 * @param  originalId the original module ID
 * @return the "raw" module ID (i.e. webpack alias entry); may need to be normalized before further usage, see [[normalizeLookUpId]]
 */
function getModId(modPaths, path, fileExtensions, originalId) {
    if (!path) {
        // console.log(' ReplaceModuleIdPlugin: handle empty path for (original) ID '+originalId+' -> alias: ', modPaths[originalId], modPaths);//DEBUG
        if (originalId) {
            if (lookUpAlias(originalId, modPaths)) {
                // console.log(' ReplaceModuleIdPlugin: handle empty path, but original ID '+originalId+' has module ID entry, using the orginial ID...');//DEBUG
                return originalId;
            }
            var normalizedOrigId = idFromPath(originalId);
            if (lookUpAlias(normalizedOrigId, modPaths)) {
                // console.log(' ReplaceModuleIdPlugin: handle empty path, but normalized original ID '+normalizedOrigId+' has module ID entry, using the normalized ID...');//DEBUG
                return normalizedOrigId;
            }
        }
        return '';
    }
    let clpath = path.replace(fileExtensions, '');
    clpath = clpath === path ? null : clpath;
    let val;
    const results = [];
    for (var p in modPaths) {
        val = modPaths[p];
        if (val === path || val === clpath) {
            results.push(p);
        }
        else if (clpath && clpath.indexOf(val) === 0) {
            // console.log('  handle package alias "'+clpath+'" -> ', p + idFromPath(clpath.substring(val.length)));//DEBUG
            results.push(p + idFromPath(clpath.substring(val.length)));
        }
    }
    const len = results.length;
    if (len > 0) {
        if (len === 1) {
            return results[0];
        }
        //if there are multiple entries/IDs -> use shortest one!
        results.sort(function (a, b) {
            return a.length - b.length;
        });
        // console.log('  handle multiple results: ', results, ': '+originalId+' -> "'+results[0]+'"');//DEBUG
        return results[0];
    }
}
function doGetAbsolutePath(ctxPath, list, id) {
    let fullpath = (0, path_1.resolve)(ctxPath, id);
    if ((0, fs_1.existsSync)(fullpath)) {
        return fullpath;
    }
    for (let i = 0, size = list.length - 1; i < size; ++i) {
        fullpath = (0, path_1.resolve)(list[i], id);
        if ((0, fs_1.existsSync)(fullpath)) {
            return fullpath;
        }
    }
}
function getAbsolutePath(compiler, mmirDir, id) {
    return doGetAbsolutePath(compiler.options.context, [process.cwd(), dir, mmirDir], id);
}
function getWebpackModuleId(module, chunkGraph) {
    if (chunkGraph && chunkGraph.getModuleId) {
        // for webpack5: use ChunkGraph API for retrieving module ID
        return chunkGraph.getModuleId(module);
    }
    else {
        // otherwise: just return the module ID field
        return module.id;
    }
}
function setWebpackModuleId(module, newId, chunkGraph) {
    if (chunkGraph && chunkGraph.getModuleId) {
        // for webpack5: use ChunkGraph API for setting module ID
        return chunkGraph.setModuleId(module, newId);
    }
    else {
        // otherwise: just set the module ID field
        return module.id = newId;
    }
}
//based on https://stackoverflow.com/a/34637718/4278324
class ReplaceModuleIdPlugin {
    constructor(alias, mmirDir, fileExtensions) {
        this.alias = alias;
        this.mmirDir = mmirDir;
        this.fileExtensions = fileExtensions;
        this.alias = alias || {};
        // console.log('ReplaceModuleIdPlugin.constructor: alias -> ', JSON.stringify(alias));
    }
    apply(compiler) {
        var processModules = (modules, compilation) => {
            // console.log('ReplaceModuleIdPlugin.beforeModuleIds: ', modules.filter(function(mod){return /parsingResult/.test(mod.rawRequest)}));
            const aliasLookup = this.alias;
            const fileExtensions = this.fileExtensions;
            // console.log('ReplaceModuleIdPlugin.beforeModuleIds: current dir "'+__dirname+'", mmir-lib dir "'+this.mmirDir+'", checking '+JSON.stringify(aliasLookup)); //DEBUG
            Array.from(modules).forEach(function (module) {
                if (getWebpackModuleId(module, compilation.chunkGraph) === null && module.libIdent) {
                    const resolvedId = module.libIdent({
                        context: compiler.options.context
                    });
                    let lookUpId;
                    let id;
                    if (resolvedId) {
                        id = (0, path_1.normalize)(resolvedId);
                        const fullpath = getAbsolutePath(compiler, this.mmirDir, id);
                        // console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ', id, ', fullpath ', fullpath); //, ', module ', module);//DEBUG
                        lookUpId = getModId(aliasLookup, fullpath, fileExtensions, id);
                        // if(/mmir-plugin-/.test(fullpath)) console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ',id, ', fullpath ', fullpath, ' -> ', lookUpId? lookUpId : 'UNKNOWN');//, ', module ', module);//DEBUG
                        // if(/mmir-plugin-/.test(id)) console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ',id, ', fullpath ', fullpath, ' -> ', lookUpId? lookUpId : 'UNKNOWN');//, ', module ', module);//DEBUG
                    }
                    else {
                        (0, log_utils_1.log)('[INFO] ReplaceModuleIdPlugin.beforeModuleIds: not resolved ', module);
                    }
                    if (lookUpId) {
                        // console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ', id, ' -> ', normalizeLookUpId(lookUpId)); //, ', module ', module);//DEBUG
                        // normalize the "raw" lookup ID
                        id = normalizeLookUpId(lookUpId);
                        module.libIdent = function () {
                            return id;
                        };
                        setWebpackModuleId(module, id, compilation.chunkGraph);
                        // console.log('TEST replaced id result: ', id)
                    }
                    // else if(/mmirf\\controller\\/.test(aliasLookup)){
                    //
                    // }
                }
                else if (process.env.verbose) {
                    (0, log_utils_1.log)('[INFO] ReplaceModuleIdPlugin.beforeModuleIds: cannot process module ', module);
                }
            }, this);
        };
        if (!compiler.hooks || !compiler.hooks.compilation) {
            // backwards compatiblity with webpack 3
            compiler.plugin('compilation', function (compilation) {
                compilation.plugin('before-module-ids', (modules) => {
                    processModules(modules, compilation);
                });
            });
        }
        else {
            compiler.hooks.compilation.tap('ReplaceModuleIdPlugin', compilation => {
                compilation.hooks.beforeModuleIds.tap('ReplaceModuleIdPlugin', (modules) => {
                    processModules(modules, compilation);
                });
            });
        }
    }
}
exports.ReplaceModuleIdPlugin = ReplaceModuleIdPlugin;
