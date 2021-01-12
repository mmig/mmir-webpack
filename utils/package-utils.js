"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const log_utils_1 = __importDefault(require("mmir-tooling/utils/log-utils"));
const warn = log_utils_1.default.warn;
function saveRequire(pkg) {
    try {
        return require(pkg);
    }
    catch (err) {
        warn('mmir-webpack: could not initialize ' + pkg + ', may need to install it  ' + err, err);
    }
}
var readUp;
function initPackageReader() {
    if (!readUp) {
        readUp = saveRequire('read-pkg-up');
    }
    return readUp;
}
var semVer;
function initSemVer() {
    if (!semVer) {
        semVer = saveRequire('semver');
    }
    return semVer;
}
function getPackageVersion(packageId) {
    initPackageReader();
    if (!readUp) {
        warn('mmir-webpack: could not load package ' + packageId + ', because of missing dependencies!');
        return void (0);
    }
    const workerLoaderPkg = readUp.sync({ cwd: require.resolve(packageId) });
    return workerLoaderPkg && (workerLoaderPkg.packageJson || workerLoaderPkg.pkg);
}
function checkPackageVersion(packageId, versionRequirement) {
    const packageJson = getPackageVersion(packageId);
    initSemVer();
    if (!packageJson || !semVer) {
        warn('mmir-webpack: could not determine version of package ' + packageId + ', because of missing dependencies!');
        return void (0);
    }
    try {
        return semVer.satisfies(packageJson.version, versionRequirement);
    }
    catch (err) {
        warn('mmir-webpack: could not determine version of ' + packageId + '! ' + err, err);
    }
}
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
function setOptionIf(options, optionNameIfTrue, optionNameIfFalse, value, useIfNone, packageId, packageVersionRequirement) {
    let isReqTrue = checkPackageVersion(packageId, packageVersionRequirement);
    if (typeof isReqTrue !== 'boolean') {
        isReqTrue = useIfNone;
    }
    const optionName = isReqTrue ? optionNameIfTrue : optionNameIfFalse;
    if (optionName) {
        options[optionName] = value;
    }
    return options;
}
module.exports = {
    getPackageVersion: getPackageVersion,
    checkPackageVersion: checkPackageVersion,
    setOptionIf: setOptionIf
};
