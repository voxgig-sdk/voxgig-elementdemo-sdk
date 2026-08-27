import { elementHandlers } from '../handlers/element.handlers.js';
import { elementSchemas } from '../schemas/element.schemas.js';
export default async function elementRoutes(fastify) {
    fastify.get('/api/element', { schema: elementSchemas.list }, elementHandlers.list);
    fastify.get('/api/element/:element_id', { schema: elementSchemas.get }, elementHandlers.get);
    fastify.post('/api/element', { schema: elementSchemas.create }, elementHandlers.create);
    fastify.put('/api/element/:element_id', { schema: elementSchemas.update }, elementHandlers.update);
    fastify.delete('/api/element/:element_id', { schema: elementSchemas.delete }, elementHandlers.delete);
    fastify.post('/api/element/:element_id/ionize', { schema: elementSchemas.ionize }, elementHandlers.ionize);
}
//# sourceMappingURL=element.routes.js.map