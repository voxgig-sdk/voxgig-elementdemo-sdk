import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateElementInput, UpdateElementInput, IonizeRequest } from '../types.js';
export declare const elementHandlers: {
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest<{
        Params: {
            element_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    create(request: FastifyRequest<{
        Body: CreateElementInput;
    }>, reply: FastifyReply): Promise<void>;
    update(request: FastifyRequest<{
        Params: {
            element_id: string;
        };
        Body: UpdateElementInput;
    }>, reply: FastifyReply): Promise<void>;
    delete(request: FastifyRequest<{
        Params: {
            element_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    ionize(request: FastifyRequest<{
        Params: {
            element_id: string;
        };
        Body: IonizeRequest;
    }>, reply: FastifyReply): Promise<void>;
};
