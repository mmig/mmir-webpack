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
export declare function getLoaderOptions(loadFuncCtx: any): any | undefined;
