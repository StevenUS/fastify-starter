import fp from 'fastify-plugin';
import { UserService } from '../services/user.service.js';
const userServicePlugin = async (fastify) => {
    fastify.decorate('userService', new UserService(fastify.db));
};
export default fp(userServicePlugin);
//# sourceMappingURL=user.plugin.js.map