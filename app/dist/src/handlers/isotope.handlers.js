import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import Nid from 'nid';
const nid = Nid.default || Nid;
export const isotopeHandlers = {
    async list(request, reply) {
        const elementStore = request.server.elementStore;
        const isotopeStore = request.server.isotopeStore;
        const element = elementStore.getById(request.params.element_id);
        if (!element) {
            throw new NotFoundError('Element', request.params.element_id);
        }
        const isotopes = isotopeStore.getByElementId(request.params.element_id);
        reply.send(isotopes);
    },
    async get(request, reply) {
        const isotopeStore = request.server.isotopeStore;
        const isotope = isotopeStore.getById(request.params.isotope_id);
        // The parent id in the path is part of the identity, not decoration.
        // Matching on isotope_id alone would make GET /api/element/fe/isotope/h-2
        // return hydrogen's record.
        if (!isotope || isotope.element_id !== request.params.element_id) {
            throw new NotFoundError('Isotope', request.params.isotope_id);
        }
        reply.send(isotope);
    },
    async create(request, reply) {
        const elementStore = request.server.elementStore;
        const isotopeStore = request.server.isotopeStore;
        const element = elementStore.getById(request.params.element_id);
        if (!element) {
            throw new NotFoundError('Element', request.params.element_id);
        }
        if (request.body.element_id !== request.params.element_id) {
            throw new ValidationError('element_id in body must match element_id in path');
        }
        // Honour a client-supplied id — see the note in element.handlers.ts.
        const id = request.body.id ?? nid(8);
        if (isotopeStore.getById(id)) {
            throw new ConflictError('Isotope', id);
        }
        const isotope = isotopeStore.create({ ...request.body, id });
        reply.code(201).send(isotope);
    },
    async update(request, reply) {
        const isotopeStore = request.server.isotopeStore;
        // Check ownership BEFORE mutating: writing first and only then
        // discovering the isotope would let a request under the wrong parent
        // still apply its changes.
        const existing = isotopeStore.getById(request.params.isotope_id);
        if (!existing || existing.element_id !== request.params.element_id) {
            throw new NotFoundError('Isotope', request.params.isotope_id);
        }
        // An isotope cannot be reparented by PUTting a different element_id —
        // merging the body wholesale would silently move it out from under the
        // URL that addressed it. Mirrors the check `create` already makes.
        if (undefined !== request.body.element_id &&
            request.body.element_id !== request.params.element_id) {
            throw new ValidationError('element_id in body must match element_id in path');
        }
        const isotope = isotopeStore.update(request.params.isotope_id, request.body);
        if (!isotope) {
            throw new NotFoundError('Isotope', request.params.isotope_id);
        }
        reply.send(isotope);
    },
    async delete(request, reply) {
        const isotopeStore = request.server.isotopeStore;
        // Ownership check before the delete, for the same reason as update:
        // DELETE /api/element/fe/isotope/h-2 must not destroy hydrogen's record.
        const existing = isotopeStore.getById(request.params.isotope_id);
        if (!existing || existing.element_id !== request.params.element_id) {
            throw new NotFoundError('Isotope', request.params.isotope_id);
        }
        const deleted = isotopeStore.delete(request.params.isotope_id);
        if (!deleted) {
            throw new NotFoundError('Isotope', request.params.isotope_id);
        }
        reply.code(204).send();
    },
    async decay(request, reply) {
        const isotopeStore = request.server.isotopeStore;
        const isotope = isotopeStore.getById(request.params.isotope_id);
        // Same ownership rule as get: the mismatch case also covers an unknown
        // element, since no isotope carries a nonexistent element_id.
        if (!isotope || isotope.element_id !== request.params.element_id) {
            throw new NotFoundError('Isotope', request.params.isotope_id);
        }
        // A stable isotope does not decay, however many steps are asked for.
        if (isotope.stable) {
            reply.send({ ok: false, mode: 'stable' });
            return;
        }
        // Walk the decay chain, at most `steps` decays. Each applied step turns
        // the current record into its `product`; the walk continues only while
        // that product is itself a record in the store AND unstable. A missing or
        // stable product ends the chain early, and the response reports the mode
        // of the last step that applied and the final product id — so the chain
        // can leave the store (u-238 -> th-234, which is not a record) and the
        // caller still learns where it went.
        //
        // Clamped below 1 so `steps: 0` cannot leave mode/product unset: an
        // unstable isotope always decays at least once.
        const steps = Math.max(1, request.body.steps ?? 1);
        let current = isotope;
        let mode = '';
        let product = '';
        for (let applied = 0; applied < steps; applied++) {
            mode = current.mode ?? '';
            product = current.product ?? '';
            const next = '' === product ? undefined : isotopeStore.getById(product);
            if (!next || next.stable) {
                break;
            }
            current = next;
        }
        reply.send({ ok: true, mode, product });
    },
};
//# sourceMappingURL=isotope.handlers.js.map