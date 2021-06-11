import { AppConfig, BuildAppConfig, WebpackAppConfig } from 'mmir-tooling';
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
export declare function getAliasEntry(aliasId: string, aliasMap: {
    [id: string]: string;
}): string | undefined;
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
export declare function isExactAliasEntry(aliasId: string, aliasMap: {
    [id: string]: string;
}): boolean;
/**
 * convert an ID to an exact-match alias entry (for webpack resolve aliases)
 *
 * @param  moduleId the ID
 * @return the alias ID for exact-matching
 */
export declare function toExactAliasId(moduleId: string): string;
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
export declare function setAliasEntry(aliasId: string, aliasEntry: string, aliasMap: {
    [id: string]: string;
}, isPreferExact: boolean): void;
/**
 * add/overwrite module alias (i.e. mapping module ID to file path)
 *
 * @param  {{paths?: {[moduleId: string]: string}}} mmirAppConfig the app-specific configuration: applies module-path-specifications from mmirAppConfig.paths
 * @param  {[{[moduleId: string]: string}]} alias the (default) mapping of module IDs to (absolute) paths
 */
export declare function addAliasFrom(mmirAppConfig: AppConfig | BuildAppConfig | WebpackAppConfig, alias: {
    [moduleId: string]: string;
}): void;
/**
 *	expand require.js package definitions & add them to the alias dictionary
 *
 * TODO extract this function to mmir-tooling?
 *
 * @param  {string} rootDir the mmir root dir (usually node_modules/mmir-lib/lib/ )
 * @param  {{[id: string]: string}} alias dictionary for module ID/alias -> module-path (INOUT parameter)
 * @param  {Array<{name: string, location: string}>} resourcesConfigPackages list of require.js package definitions
 */
export declare function expandPackageResources(rootDir: string, alias: {
    [id: string]: string;
}, resourcesConfigPackages: {
    name: string;
    location: string;
}[]): void;
export declare function createResolveAlias(mmirAppConfig: WebpackAppConfig, mmirLibRootDir: string, webpackRootDir: string): {
    [id: string]: string;
};
