import { ConflictError, NotFoundError } from '../utils/errors.js';
import Nid from 'nid';
const nid = Nid.default || Nid;
export const elementHandlers = {
    async list(request, reply) {
        const elementStore = request.server.elementStore;
        const elements = elementStore.getAll();
        reply.send(elements);
    },
    async get(request, reply) {
        const elementStore = request.server.elementStore;
        const element = elementStore.getById(request.params.element_id);
        if (!element) {
            throw new NotFoundError('Element', request.params.element_id);
        }
        reply.send(element);
    },
    async create(request, reply) {
        const elementStore = request.server.elementStore;
        // Honour a client-supplied id. OpenAPI requires one on create and the
        // generated SDK type does too, so every SDK caller sends one; overwriting
        // it with nid(8) would break every SDK create round-trip — the caller
        // would get back a record it could not then load by the id it had chosen.
        // Generated only when absent, which keeps the server a superset of the
        // spec.
        const id = request.body.id ?? nid(8);
        if (elementStore.getById(id)) {
            throw new ConflictError('Element', id);
        }
        const element = elementStore.create({ ...request.body, id });
        reply.code(201).send(element);
    },
    async update(request, reply) {
        const elementStore = request.server.elementStore;
        const element = elementStore.update(request.params.element_id, request.body);
        if (!element) {
            throw new NotFoundError('Element', request.params.element_id);
        }
        reply.send(element);
    },
    async delete(request, reply) {
        const elementStore = request.server.elementStore;
        const deleted = elementStore.delete(request.params.element_id);
        if (!deleted) {
            throw new NotFoundError('Element', request.params.element_id);
        }
        reply.code(204).send();
    },
    async ionize(request, reply) {
        const elementStore = request.server.elementStore;
        const element = elementStore.getById(request.params.element_id);
        if (!element) {
            throw new NotFoundError('Element', request.params.element_id);
        }
        const charge = request.body.charge ?? 1;
        // A charge of zero is no ion at all: the atom keeps its electrons, so
        // the answer is the bare symbol and ok is false.
        if (0 === charge) {
            reply.send({ ok: false, ion: element.symbol });
            return;
        }
        // Standard ion notation: symbol, then the magnitude when it is more than
        // one, then the sign — Fe + 3 is 'Fe3+', O - 2 is 'O2-', H + 1 is 'H+'.
        const magnitude = Math.abs(charge);
        const ion = element.symbol +
            (1 < magnitude ? String(magnitude) : '') +
            (0 < charge ? '+' : '-');
        reply.send({ ok: true, ion });
    },
};
//# sourceMappingURL=element.handlers.js.map