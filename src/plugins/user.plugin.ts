import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { UserService } from '../services/user.service.js';

const userServicePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('userService', new UserService(fastify.db));
};

// Type declaration for Fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    userService: UserService;
  }
}

export default fp(userServicePlugin);
