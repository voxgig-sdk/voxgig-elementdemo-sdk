import { seriesHandlers } from '../handlers/series.handlers.js';
import { seriesSchemas } from '../schemas/series.schemas.js';
// Series are READ-ONLY per the OpenAPI definition, same as group.routes.ts:
// GET list and GET load only.
export default async function seriesRoutes(fastify) {
    fastify.get('/series', { schema: seriesSchemas.list }, seriesHandlers.list);
    fastify.get('/series/:series_id', { schema: seriesSchemas.get }, seriesHandlers.get);
}
//# sourceMappingURL=series.routes.js.map