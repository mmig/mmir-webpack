
var warn = require('mmir-tooling/utils/log-utils').warn;

function saveRequire(pkg) {
	try {
		return require(pkg);
	} catch(err){
		warn('mmir-webpack: could not initialize '+pkg+', may need to install it  '+err, err);
	}
}

var readUp;
function initPackageReader() {
	if(!readUp){
		readUp = saveRequire('read-pkg-up');
	}
	return readUp;
}

var semVer;
function initSemVer() {
	if(!semVer){
		semVer = saveRequire('semver');
	}
	return semVer;
}

function getPackageVersion(packageId){
	initPackageReader();
	if(!readUp){
		warn('mmir-webpack: could not load package '+packageId+', because of missing dependencies!');
		return void(0);
	}
	var workerLoaderPkg = readUp.sync({cwd: require.resolve(packageId)});
	return workerLoaderPkg && (workerLoaderPkg.packageJson || workerLoaderPkg.pkg);
}

function checkPackageVersion(packageId, versionRequirement){
	var packageJson = getPackageVersion(packageId);
	initSemVer();
	if(!packageJson || !semVer){
		warn('mmir-webpack: could not determine version of package '+packageId+', because of missing dependencies!');
		return void(0);
	}
	try {
		return semVer.satisfies(packageJson.version, versionRequirement)
	} catch(err){
		warn('mmir-webpack: could not determine version of '+packageId+'! '+err, err);
	}
}

function setOptionIf(options, optionNameIfTrue, optionNameIfFalse, value, useIfNone, packageId, packageVersionRequirement){

	var isReqTrue = checkPackageVersion(packageId, packageVersionRequirement);
	if(typeof isReqTrue !== 'boolean'){
		isReqTrue = useIfNone;
	}
	options[isReqTrue? optionNameIfTrue : optionNameIfFalse] = value;
	return options;
}

module.exports = {
	getPackageVersion: getPackageVersion,
	checkPackageVersion: checkPackageVersion,
	setOptionIf: setOptionIf
}
