
import fileUtils from 'mmir-tooling/utils/filepath-utils';
import grammarGen from 'mmir-tooling/grammar/grammar-gen';

const loaderUtils = require('loader-utils');

const grammarLoader = function(content, map, meta) {
    var callback = this.async();

    var options = loaderUtils.getOptions(this) || {};
    // log('mmir-grammer-loader: options -> ', options);//DEBUG
    if(!options || !options.mapping){
        callback('failed to parse JSON grammar: missing list for grammar settings [{id: "the ID", file: "the file path", ...}, ...]');
        return;/////////////// EARLY EXIT /////////////////
    }

    var grammarFile = fileUtils.normalizePath(this.resource);

    grammarGen.compile(content, grammarFile, options, callback, map, meta);
    return;
};

//HACK force prevention of json-loader
var jsonLoaderPath: string;
grammarLoader.pitch = function(_remainingRequest, _precedingRequest, _data) {

    // log('mmir-grammer-loader: PITCHing | remaining: ', _remainingRequest, ' | preceding: ', _precedingRequest, ' | data: ', _data);//DEBUG
    // log('mmir-grammer-loader: PITCHing options -> ',loaderUtils.getOptions(this));//DEBUG

    var options = loaderUtils.getOptions(this);
    grammarGen.initPendingAsyncGrammarInfo(options);

    //HACK for webpack < 4.x the Rule.type property for indicating the conversion JSON -> javascript is not allowed
    //     -> for webpack >= 2.x the json-loader may register itself for the JSON grammar which would produce errors
    //        since it will receive the javascript code emitted by the grammar-loader
    //     WORKAROUND/HACK: try to detect json-loader, and remove it if present:
    var options = loaderUtils.getOptions(this);
    if(options && options.isRuleTypeDisabled){//<- this will be set, if Rule.type had to be removed due to webpack version < 4.x

        if(!jsonLoaderPath){
            try{
                jsonLoaderPath = fileUtils.normalizePath(require.resolve('json-loader'));
            } catch(err){
                //-> json-loader is not available
                // log('mmir-grammer-loader: PITCHing phase, [WARN] json-loader prevention WORKAROUND - options.isRuleTypeDisabled is set, but json-loader module cannot be resolved, arguments: | remainingRequest: ', remainingRequest, ' | precedingRequest: ', precedingRequest, ' | data: ', data);
                //-> ignore: no use trying to remove json-loader from this.loaders...
                return;////////////// EARLY EXIT /////////////////////////
            }
        }

        for(var i=this.loaders.length-1; i >= 0; --i){
            // log('mmir-grammer-loader: checking loaders at ', i, ' -> ', this.loaders[i]);//DEBUG
            // for(var n in this.loaders[i]) log('mmir-grammer-loader: loaders ', i, '['+n+'] -> ', this.loaders[i][n])//DEBUG
            if(fileUtils.normalizePath(this.loaders[i].path) === jsonLoaderPath){
                // log('mmir-grammer-loader: removing default json-loader at ', i);//DEBUG
                this.loaders.splice(i,1)
            }
        }
    }
};

export = grammarLoader;
