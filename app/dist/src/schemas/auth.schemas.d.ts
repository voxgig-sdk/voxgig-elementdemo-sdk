export declare const authSchemas: {
    token: {
        params: {
            type: string;
            required: string[];
            properties: {
                account_id: {
                    type: string;
                };
            };
        };
        body: {
            type: string;
            required: string[];
            properties: {
                refresh_token: {
                    type: string;
                };
            };
            additionalProperties: boolean;
        };
        response: {
            200: {
                type: string;
                properties: {
                    access_token: {
                        type: string;
                    };
                    token_type: {
                        type: string;
                    };
                    expires_in_requests: {
                        type: string;
                    };
                };
            };
            400: {
                $ref: string;
            };
            401: {
                $ref: string;
            };
        };
    };
};
