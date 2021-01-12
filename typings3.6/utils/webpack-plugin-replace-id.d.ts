export declare class ReplaceModuleIdPlugin {
    alias: {
        [id: string]: string;
    };
    mmirDir: string;
    fileExtensions: RegExp;
    constructor(alias: {
        [id: string]: string;
    }, mmirDir: string, fileExtensions: RegExp);
    apply(compiler: any): void;
}
