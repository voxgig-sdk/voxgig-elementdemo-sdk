export declare const elementSchemas: {
    list: {
        response: {
            200: {
                type: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
    get: {
        params: {
            type: string;
            required: string[];
            properties: {
                element_id: {
                    type: string;
                };
            };
        };
        response: {
            200: {
                $ref: string;
            };
            404: {
                $ref: string;
            };
        };
    };
    create: {
        body: {
            type: string;
            required: string[];
            properties: {
                id: {
                    type: string;
                };
                name: {
                    type: string;
                };
                symbol: {
                    type: string;
                };
                number: {
                    type: string;
                };
                period: {
                    type: string;
                };
                block: {
                    type: string;
                };
                series_id: {
                    type: string;
                };
                mass: {
                    type: string;
                };
                group: {
                    type: string;
                };
                phase: {
                    type: string;
                };
                discovered: {
                    type: string;
                };
            };
            additionalProperties: boolean;
        };
        response: {
            201: {
                $ref: string;
            };
            400: {
                $ref: string;
            };
            409: {
                $ref: string;
            };
        };
    };
    update: {
        params: {
            type: string;
            required: string[];
            properties: {
                element_id: {
                    type: string;
                };
            };
        };
        body: {
            type: string;
            properties: {
                id: {
                    type: string;
                };
                name: {
                    type: string;
                };
                symbol: {
                    type: string;
                };
                number: {
                    type: string;
                };
                period: {
                    type: string;
                };
                block: {
                    type: string;
                };
                series_id: {
                    type: string;
                };
                mass: {
                    type: string;
                };
                group: {
                    type: string;
                };
                phase: {
                    type: string;
                };
                discovered: {
                    type: string;
                };
            };
            additionalProperties: boolean;
        };
        response: {
            200: {
                $ref: string;
            };
            404: {
                $ref: string;
            };
        };
    };
    delete: {
        params: {
            type: string;
            required: string[];
            properties: {
                element_id: {
                    type: string;
                };
            };
        };
        response: {
            204: {
                type: string;
            };
            404: {
                $ref: string;
            };
        };
    };
    ionize: {
        params: {
            type: string;
            required: string[];
            properties: {
                element_id: {
                    type: string;
                };
            };
        };
        body: {
            type: string;
            properties: {
                charge: {
                    type: string;
                };
            };
            additionalProperties: boolean;
        };
        response: {
            200: {
                type: string;
                properties: {
                    ok: {
                        type: string;
                    };
                    ion: {
                        type: string;
                    };
                };
            };
            404: {
                $ref: string;
            };
        };
    };
};
