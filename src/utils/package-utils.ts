

import logUtils from 'mmir-tooling/utils/log-utils';
const warn = logUtils.warn;

interface PackageJson {
    version: string;
}

function saveRequire(pkg: string): any {
    try {
        return require(pkg);
    } catch(err){
        warn('mmir-webpack: could not initialize '+pkg+', may need to install it  '+err, err);
    }
}

var readUp: &{sync(options: {cwd?: string}): {packageJson?: PackageJson, pkg?: PackageJson} };
function initPackageReader(): typeof readUp {
    if(!readUp){
        readUp = saveRequire('read-pkg-up');
    }
    return readUp;
}

var semVer: &{satisfies(version: string, requirement: string): boolean};
function initSemVer(): typeof semVer {
    if(!semVer){
        semVer = saveRequire('semver');
    }
    return semVer;
}

function getPackageVersion(packageId: string): PackageJson {
    initPackageReader();
    if(!readUp){
        warn('mmir-webpack: could not load package '+packageId+', because of missing dependencies!');
        return void(0);
    }
    const workerLoaderPkg = readUp.sync({cwd: require.resolve(packageId)});
    return workerLoaderPkg && (workerLoaderPkg.packageJson || workerLoaderPkg.pkg);
}

function checkPackageVersion(packageId: string, versionRequirement: string): boolean | undefined {
    const packageJson = getPackageVersion(packageId);
    initSemVer();
    if(!packageJson || !semVer){
        warn('mmir-webpack: could not determine version of package '+packageId+', because of missing dependencies!');
        return void(0);
    }
    try {
        return semVer.satisfies(packageJson.version, versionRequirement);
    } catch(err){
        warn('mmir-webpack: could not determine version of '+packageId+'! '+err, err);
    }
}

function setOptionIf(options: {[options: string]: any}, optionNameIfTrue: string | null, optionNameIfFalse: string | null, value: any, useIfNone: boolean, packageId: string, packageVersionRequirement: string): {[options: string]: any} {

    var isReqTrue = checkPackageVersion(packageId, packageVersionRequirement);
    if(typeof isReqTrue !== 'boolean'){
        isReqTrue = useIfNone;
    }
    options[isReqTrue? optionNameIfTrue : optionNameIfFalse] = value;
    return options;
}

export = {
    getPackageVersion: getPackageVersion,
    checkPackageVersion: checkPackageVersion,
    setOptionIf: setOptionIf
}
