export declare const groupSchemas: {
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
                group_id: {
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
};
