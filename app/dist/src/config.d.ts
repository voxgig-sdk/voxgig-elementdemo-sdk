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
export declare function debugRouteEnabled(env?: NodeJS.ProcessEnv): boolean;
