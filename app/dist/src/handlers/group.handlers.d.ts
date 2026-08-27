import type { FastifyRequest, FastifyReply } from 'fastify';
export declare const groupHandlers: {
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest<{
        Params: {
            group_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
};
