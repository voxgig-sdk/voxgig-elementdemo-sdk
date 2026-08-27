import { NotFoundError } from '../utils/errors.js';
// Groups are READ-ONLY reference data: list and get are the whole surface.
// No create/update/delete handlers exist, so no route can be wired to one —
// see the note on GroupStore.
export const groupHandlers = {
    async list(request, reply) {
        const groupStore = request.server.groupStore;
        const groups = groupStore.getAll();
        reply.send(groups);
    },
    async get(request, reply) {
        const groupStore = request.server.groupStore;
        const group = groupStore.getById(request.params.group_id);
        if (!group) {
            throw new NotFoundError('Group', request.params.group_id);
        }
        reply.send(group);
    },
};
//# sourceMappingURL=group.handlers.js.map