import { WebpackAppConfig } from 'mmir-tooling';
import * as appConfigUtils from 'mmir-tooling/utils/module-config-init';
declare type AppConfigUtils = typeof appConfigUtils;
interface WebpackAppConfigUtils extends AppConfigUtils {
    generateModuleCode(mmirAppConfig: WebpackAppConfig): string;
}
declare const webpackAppConfigUtils: WebpackAppConfigUtils;
export = webpackAppConfigUtils;
