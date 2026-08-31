import type { Account } from './types.js';
export declare const config: {
    server: {
        host: string;
        port: number;
    };
    logging: {
        level: string;
    };
    data: {
        initialDataPath: string;
    };
};
export declare function accountList(env?: NodeJS.ProcessEnv): Account[];
export declare function accessTokenUses(env?: NodeJS.ProcessEnv): number;
export declare function debugRouteEnabled(env?: NodeJS.ProcessEnv): boolean;
