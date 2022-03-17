
const loaderUtils = require('loader-utils');

/**
 * HELPER for backwards compatibility of loader-utils (i.e. before/after v3)
 *
 * since loader-utils v3:
 * ```
 * loaderFunction(){
 *   this.getOptions();  // where this is the loadFuncCtx
 * }
 * ```
 *
 * up to loader-utils v2.x:
 * ```
 * const loaderUtils = require('loader-utils');
 * loaderFunction(){
 *   loaderUtils.getOptions(this);
 * }
 * ```
 *
 * @param  loadFuncCtx  [description]
 * @param  loaderUtils  [description]
 * @return [description]
 */
export function getLoaderOptions(loadFuncCtx: any): any | undefined {
    if(loadFuncCtx && typeof loadFuncCtx.getOptions === 'function'){
        return loadFuncCtx.getOptions();
    }
    return loaderUtils.getOptions(loadFuncCtx);
}
