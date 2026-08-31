import { isotopeHandlers } from '../handlers/isotope.handlers.js';
import { isotopeSchemas } from '../schemas/isotope.schemas.js';
export default async function isotopeRoutes(fastify) {
    fastify.get('/element/:element_id/isotope', { schema: isotopeSchemas.list }, isotopeHandlers.list);
    fastify.get('/element/:element_id/isotope/:isotope_id', { schema: isotopeSchemas.get }, isotopeHandlers.get);
    fastify.post('/element/:element_id/isotope', { schema: isotopeSchemas.create }, isotopeHandlers.create);
    fastify.put('/element/:element_id/isotope/:isotope_id', { schema: isotopeSchemas.update }, isotopeHandlers.update);
    fastify.delete('/element/:element_id/isotope/:isotope_id', { schema: isotopeSchemas.delete }, isotopeHandlers.delete);
    fastify.post('/element/:element_id/isotope/:isotope_id/decay', { schema: isotopeSchemas.decay }, isotopeHandlers.decay);
}
//# sourceMappingURL=isotope.routes.js.map