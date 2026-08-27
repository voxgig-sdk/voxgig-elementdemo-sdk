import type { FastifyRequest, FastifyReply } from 'fastify';
export declare const seriesHandlers: {
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest<{
        Params: {
            series_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
};
