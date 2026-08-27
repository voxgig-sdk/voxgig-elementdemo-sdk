export declare const seriesSchemas: {
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
                series_id: {
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
