declare const OPTSPEC: {
    allow: {
        method: string;
        op: string;
    };
    apikey: string;
    auth: {
        basic: boolean;
        in: string;
        name: string;
        prefix: string;
    };
    base: string;
    clean: {
        active: boolean;
        hint: string;
        keys: string;
        mask: string;
        min: string;
        values: string;
    };
    entity: {
        "`$CHILD`": {
            "`$OPEN`": boolean;
            active: boolean;
            alias: {};
        };
    };
    extend: string;
    headers: {
        "`$CHILD`": string;
    };
    prefix: string;
    secret: string;
    server: {
        "`$CHILD`": string;
    };
    suffix: string;
    system: {
        fetch: string;
    };
    test: {
        active: boolean;
        entity: {
            "`$OPEN`": boolean;
        };
    };
    utility: {};
    feature: {
        "`$CHILD`": {
            "`$OPEN`": boolean;
            active: boolean;
        };
        debug: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            max?: undefined;
            redact?: undefined;
            now?: undefined;
            onEntry?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            max: (string | {
                min: number;
            })[];
            redact: (string | {
                min: number;
            })[];
            now: (string | {
                min: number;
            })[];
            onEntry: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        elementcard: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            print?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            print: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        idempotency: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            header?: undefined;
            methods?: undefined;
            ops?: undefined;
            keygen?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            header: (string | string[] | {
                min: number;
            })[];
            methods: (string | {
                min: number;
            })[];
            ops: (string | {
                min: number;
            })[];
            keygen: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        metrics: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            now?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            now: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        paging: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            afterVar?: undefined;
            cursorParam?: undefined;
            firstVar?: undefined;
            limitParam?: undefined;
            pageParam?: undefined;
            startPage?: undefined;
            limit?: undefined;
            ops?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            afterVar: (string | string[] | {
                min: number;
            })[];
            cursorParam: (string | string[] | {
                min: number;
            })[];
            firstVar: (string | string[] | {
                min: number;
            })[];
            limitParam: (string | string[] | {
                min: number;
            })[];
            pageParam: (string | string[] | {
                min: number;
            })[];
            startPage: (string | {
                min: number;
            })[];
            limit: (string | {
                min: number;
            })[];
            ops: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        ratelimit: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            burst?: undefined;
            rate?: undefined;
            now?: undefined;
            sleep?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            burst: (string | {
                min: number;
            })[];
            rate: (string | {
                min: number;
            })[];
            now: (string | {
                min: number;
            })[];
            sleep: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        retry: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            factor?: undefined;
            maxDelay?: undefined;
            minDelay?: undefined;
            retries?: undefined;
            statuses?: undefined;
            jitter?: undefined;
            sleep?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            factor: (string | {
                min: number;
            })[];
            maxDelay: (string | {
                min: number;
            })[];
            minDelay: (string | {
                min: number;
            })[];
            retries: (string | {
                min: number;
            })[];
            statuses: (string | {
                min: number;
            })[];
            jitter: (string | {
                min: number;
            })[];
            sleep: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        secrets: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            cache?: undefined;
            exchange?: undefined;
            name?: undefined;
            providers?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            cache: (string | {
                min: number;
            })[];
            exchange: (string | {
                min: number;
            })[];
            name: (string | string[] | {
                min: number;
            })[];
            providers: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        test: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            entity?: undefined;
            net?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            entity: (string | {
                min: number;
            })[];
            net: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
        timeout: (string | {
            min: number;
            "`$OPEN`"?: undefined;
            active?: undefined;
            ms?: undefined;
            clearTimer?: undefined;
            now?: undefined;
            setTimer?: undefined;
        } | {
            "`$OPEN`": boolean;
            active: (string | {
                min: number;
            })[];
            ms: (string | {
                min: number;
            })[];
            clearTimer: (string | {
                min: number;
            })[];
            now: (string | {
                min: number;
            })[];
            setTimer: (string | {
                min: number;
            })[];
            min?: undefined;
        })[];
    };
};
declare const ENTITYSPEC: {};
export { OPTSPEC, ENTITYSPEC, };
