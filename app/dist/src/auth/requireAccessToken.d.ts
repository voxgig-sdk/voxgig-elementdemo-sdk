import type { FastifyRequest } from 'fastify';
export declare function bearerToken(request: FastifyRequest): string;
export declare function requireAccessToken(request: FastifyRequest): Promise<void>;
