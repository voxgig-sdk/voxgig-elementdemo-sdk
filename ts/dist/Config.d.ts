import { BaseFeature } from './feature/base/BaseFeature';
declare class Config {
    makeFeature(this: any, fn: string): BaseFeature;
    hasFeature(this: any, fn: string): boolean;
    main: {
        name: string;
        slug: string;
        version: string;
        target: string;
    };
    feature: {
        elementcard: {
            options: {
                active: boolean;
                print: boolean;
            };
            transport: string;
        };
        retry: {
            options: {
                active: boolean;
                factor: number;
                maxDelay: number;
                minDelay: number;
                retries: number;
                statuses: number[];
            };
            transport: string;
        };
        test: {
            options: {
                active: boolean;
            };
            transport: string;
        };
        timeout: {
            options: {
                active: boolean;
                ms: number;
            };
            transport: string;
        };
    };
    options: {
        base: string;
        headers: {
            "content-type": string;
        };
        entity: {
            element: {};
            group: {};
            isotope: {};
            series: {};
        };
    };
    entity: {
        element: {
            fields: ({
                name: string;
                req: boolean;
                short: string;
                type: string;
            } | {
                name: string;
                type: string;
                req?: undefined;
                short?: undefined;
            } | {
                name: string;
                short: string;
                type: string;
                req?: undefined;
            })[];
            name: string;
            op: {
                create: {
                    input: string;
                    name: string;
                    points: ({
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                element_id: string;
                            };
                        };
                        select: {
                            $action: string;
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    } | {
                        args: {
                            params?: undefined;
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        select: {
                            $action?: undefined;
                            exist?: undefined;
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                        rename?: undefined;
                    })[];
                };
                list: {
                    input: string;
                    name: string;
                    points: {
                        args: {};
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        select: {};
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                load: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                element_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                remove: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                element_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                update: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                element_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
            };
            relations: {
                ancestors: never[];
            };
        };
        group: {
            fields: ({
                name: string;
                req: boolean;
                short: string;
                type: string;
            } | {
                name: string;
                short: string;
                type: string;
                req?: undefined;
            })[];
            name: string;
            op: {
                list: {
                    input: string;
                    name: string;
                    points: {
                        args: {};
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        select: {};
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                load: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                group_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
            };
            relations: {
                ancestors: never[];
            };
        };
        isotope: {
            fields: ({
                name: string;
                short: string;
                type: string;
                req?: undefined;
            } | {
                name: string;
                req: boolean;
                short: string;
                type: string;
            } | {
                name: string;
                type: string;
                short?: undefined;
                req?: undefined;
            })[];
            name: string;
            op: {
                create: {
                    input: string;
                    name: string;
                    points: ({
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                isotope_id: string;
                            };
                        };
                        select: {
                            $action: string;
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    } | {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        select: {
                            exist: string[];
                            $action?: undefined;
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                        rename?: undefined;
                    })[];
                };
                list: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                load: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                isotope_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                remove: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                isotope_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                update: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                isotope_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
            };
            relations: {
                ancestors: string[][];
            };
        };
        series: {
            fields: {
                name: string;
                req: boolean;
                short: string;
                type: string;
            }[];
            name: string;
            op: {
                list: {
                    input: string;
                    name: string;
                    points: {
                        args: {};
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        select: {};
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
                load: {
                    input: string;
                    name: string;
                    points: {
                        args: {
                            params: {
                                kind: string;
                                name: string;
                                orig: string;
                                reqd: boolean;
                                type: string;
                            }[];
                        };
                        kind: string;
                        method: string;
                        orig: string;
                        parts: string[];
                        rename: {
                            param: {
                                series_id: string;
                            };
                        };
                        select: {
                            exist: string[];
                        };
                        transform: {
                            req: string;
                            res: string;
                        };
                    }[];
                };
            };
            relations: {
                ancestors: never[];
            };
        };
    };
}
declare const config: Config;
export { config };
