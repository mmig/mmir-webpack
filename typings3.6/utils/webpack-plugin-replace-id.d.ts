import { Compiler, Module } from 'webpack';
export interface FixedIdModule extends Module {
    libIdent(options: any): string;
}
export declare class ReplaceModuleIdPlugin {
    alias: {
        [id: string]: string;
    };
    mmirDir: string;
    fileExtensions: RegExp;
    private _compilation?;
    constructor(alias: {
        [id: string]: string;
    }, mmirDir: string, fileExtensions: RegExp);
    apply(compiler: Compiler): void;
}
