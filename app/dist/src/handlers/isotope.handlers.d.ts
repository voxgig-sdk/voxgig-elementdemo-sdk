import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateIsotopeInput, UpdateIsotopeInput, DecayRequest } from '../types.js';
export declare const isotopeHandlers: {
    list(request: FastifyRequest<{
        Params: {
            element_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest<{
        Params: {
            element_id: string;
            isotope_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    create(request: FastifyRequest<{
        Params: {
            element_id: string;
        };
        Body: CreateIsotopeInput;
    }>, reply: FastifyReply): Promise<void>;
    update(request: FastifyRequest<{
        Params: {
            element_id: string;
            isotope_id: string;
        };
        Body: UpdateIsotopeInput;
    }>, reply: FastifyReply): Promise<void>;
    delete(request: FastifyRequest<{
        Params: {
            element_id: string;
            isotope_id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    decay(request: FastifyRequest<{
        Params: {
            element_id: string;
            isotope_id: string;
        };
        Body: DecayRequest;
    }>, reply: FastifyReply): Promise<void>;
};
