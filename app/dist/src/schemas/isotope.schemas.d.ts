export declare const isotopeSchemas: {
    list: {
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
                type: string;
                items: {
                    $ref: string;
                };
            };
            404: {
                $ref: string;
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
                isotope_id: {
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
            required: string[];
            properties: {
                id: {
                    type: string;
                };
                element_id: {
                    type: string;
                };
                name: {
                    type: string;
                };
                mass_number: {
                    type: string;
                };
                mass: {
                    type: string;
                };
                stable: {
                    type: string;
                };
                abundance: {
                    type: string;
                };
                halflife: {
                    type: string;
                };
                mode: {
                    type: string;
                };
                product: {
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
            404: {
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
                isotope_id: {
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
                element_id: {
                    type: string;
                };
                name: {
                    type: string;
                };
                mass_number: {
                    type: string;
                };
                mass: {
                    type: string;
                };
                stable: {
                    type: string;
                };
                abundance: {
                    type: string;
                };
                halflife: {
                    type: string;
                };
                mode: {
                    type: string;
                };
                product: {
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
                isotope_id: {
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
    decay: {
        params: {
            type: string;
            required: string[];
            properties: {
                element_id: {
                    type: string;
                };
                isotope_id: {
                    type: string;
                };
            };
        };
        body: {
            type: string;
            properties: {
                steps: {
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
                    mode: {
                        type: string;
                    };
                    product: {
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
