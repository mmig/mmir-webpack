
import { existsSync } from 'fs';
import { sep, normalize, resolve } from 'path';

const dir = __dirname;

const reNormalize = sep !== '/'? new RegExp(sep.replace(/\\/g, '\\\\'), 'g') : null;
function idFromPath(path: string): string {
    if(reNormalize){
        path = path.replace(reNormalize, '/');
    }
    return path;
}

function getModId(_modPaths: {[id: string]: string}, path: string, fileExtensions: RegExp, originalId: string): string {
    if(!path){
        // console.log(' ReplaceModuleIdPlugin: handle empty path for (original) ID '+originalId+' -> alias: ', _modPaths[originalId], _modPaths);//DEBUG
        if(originalId){
            if(_modPaths[originalId]){
                // console.log(' ReplaceModuleIdPlugin: handle empty path, but original ID '+originalId+' has module ID entry, using the orginial ID...');//DEBUG
                return originalId;
            }
            var normalizedOrigId = idFromPath(originalId);
            if(_modPaths[normalizedOrigId]){
                // console.log(' ReplaceModuleIdPlugin: handle empty path, but normalized original ID '+normalizedOrigId+' has module ID entry, using the normalized ID...');//DEBUG
                return normalizedOrigId;
            }
        }
        return '';
    }
    let clpath: string = path.replace(fileExtensions, '');
    clpath = clpath === path? null : clpath;
    let val: string;
    const results: string[] = [];
    for (var p in _modPaths) {
        val = _modPaths[p];
        if (val === path || val === clpath) {
            results.push(p);
        } else if(clpath && clpath.indexOf(val) === 0){
            // console.log('  handle package alias "'+clpath+'" -> ', p + idFromPath(clpath.substring(val.length)));//DEBUG
            results.push(p + idFromPath(clpath.substring(val.length)));
        }
    }
    const len = results.length;
    if(len > 0){
        if(len === 1){
            return results[0];
        }
        //if there are multiple entries/IDs -> use shortest one!
        results.sort(function(a, b){
            return a.length - b.length;
        });
        // console.log('  handle multiple results: ', results, ': '+originalId+' -> "'+results[0]+'"');//DEBUG
        return results[0];
    }
}

function doGetAbsolutePath(ctxPath: string, list: string[], id: string) {
    let fullpath: string = resolve(ctxPath, id);
    if(existsSync(fullpath)){
        return fullpath;
    }
    for(let i = 0, size = list.length - 1; i < size; ++i){
        fullpath = resolve(list[i], id);
        if(existsSync(fullpath)){
            return fullpath;
        }
    }
}

function getAbsolutePath(compiler, mmirDir: string, id: string) {
    return doGetAbsolutePath(compiler.options.context, [process.cwd(), dir, mmirDir], id);
}

//based on https://stackoverflow.com/a/34637718/4278324

export class ReplaceModuleIdPlugin {

    constructor(public alias: {[id: string]: string}, public mmirDir: string, public fileExtensions: RegExp) {
        this.alias = alias || {};
            // console.log('ReplaceModuleIdPlugin.constructor: alias -> ', JSON.stringify(alias));
    }

    apply(compiler) {

        var processModules = (modules) => {
            // console.log('ReplaceModuleIdPlugin.beforeModuleIds: ', modules.filter(function(mod){return /parsingResult/.test(mod.rawRequest)}));

            const aliasLookup = this.alias;
            const fileExtensions = this.fileExtensions;

            // console.log('ReplaceModuleIdPlugin.beforeModuleIds: current dir "'+__dirname+'", mmir-lib dir "'+this.mmirDir+'", checking '+JSON.stringify(aliasLookup)); //DEBUG

            modules.forEach(function(module) {
                if (module.id === null && module.libIdent) {
                    let id = normalize( module.libIdent({
                        context: compiler.options.context
                    }));
                    const fullpath = getAbsolutePath(compiler, this.mmirDir, id);

                    // console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ', id, ', fullpath ', fullpath); //, ', module ', module);//DEBUG

                    const lookUpId = getModId(aliasLookup, fullpath, fileExtensions, id);

                    // if(/mmir-plugin-/.test(fullpath)) console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ',id, ', fullpath ', fullpath, ' -> ', lookUpId? lookUpId : 'UNKNOWN');//, ', module ', module);//DEBUG
                    // if(/mmir-plugin-/.test(id)) console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ',id, ', fullpath ', fullpath, ' -> ', lookUpId? lookUpId : 'UNKNOWN');//, ', module ', module);//DEBUG

                    if (lookUpId) {

                        // if(/controller/.test(lookUpId)) console.log('ReplaceModuleIdPlugin.beforeModuleIds->forEach id ',id, ' -> ', lookUpId,', fullpath ', fullpath);//, ', module ', module);//DEBUG

                        id = lookUpId;

                        module.libIdent = function() {
                            return id;
                        }

                        module.id = id;
                    }
                } else if(process.env.verbose) {
                    console.log('[WARN] ReplaceModuleIdPlugin.beforeModuleIds: cannot process module ', module);
                }
            }, this);
        };

        if (!compiler.hooks || !compiler.hooks.compilation) {
            compiler.plugin('compilation', function(compilation) {
                compilation.plugin('before-module-ids', processModules)
            });
        } else {
            compiler.hooks.compilation.tap('ReplaceModuleIdPlugin', compilation => {
                compilation.hooks.beforeModuleIds.tap('ReplaceModuleIdPlugin', processModules);
            });
        }

    }
}
