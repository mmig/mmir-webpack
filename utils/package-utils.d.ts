interface PackageJson {
    version: string;
}
declare function getPackageVersion(packageId: string): PackageJson;
declare function checkPackageVersion(packageId: string, versionRequirement: string): boolean | undefined;
/**
 * HELPER for setting option-values to different option-names, depending on the package version
 *
 * @param  options the options object (INOUT parameter)
 * @param  optionNameIfTrue the option name in case `packageVersionRequirement` evaluates to `true` (if `null` and the version is matching, then the option will be omitted)
 * @param  optionNameIfFalse the option name in case `packageVersionRequirement` evaluates to `false` (if `null` and the version is not matching, then the option will be omitted)
 * @param  value the option value
 * @param  useIfNone the option-name to use, in case the version could not be determined (i.e. `true` for `optionNameIfTrue`, `false` for `optionNameIfFalse`)
 * @param  packageId the package ID, e.g. "worker-loader"
 * @param  packageVersionRequirement the requirement for the package version (according to `sem-ver.satisfy()`), e.g. ">= 3.0.0"
 * @return the options
 */
declare function setOptionIf(options: {
    [options: string]: any;
}, optionNameIfTrue: string | null, optionNameIfFalse: string | null, value: any, useIfNone: boolean, packageId: string, packageVersionRequirement: string): {
    [options: string]: any;
};
declare const _default: {
    getPackageVersion: typeof getPackageVersion;
    checkPackageVersion: typeof checkPackageVersion;
    setOptionIf: typeof setOptionIf;
};
export = _default;
