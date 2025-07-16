import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { AuthService } from '../services/auth.service.js';

declare module 'fastify' {
  interface FastifyInstance {
    authService: AuthService;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user?: {
      id: number;
      sessionId: number;
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Register auth service
  fastify.decorate('authService', new AuthService(fastify.db));
  // Register method to be used in hook
  fastify.decorate('authenticate', authenticate);
};

export default fp(authPlugin, {
  name: 'auth-plugin',
  dependencies: ['cookie-plugin'], // Ensures cookie plugin is loaded first
});

// Create a separate hook that can be used explicitly on protected routes
const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.cookies.session_token;

  if (!token) {
    return reply.status(401).send({ error: 'No session token provided' });
  }

  try {
    const { isValid, session } = await request.server.authService.validateSession(token);

    if (!isValid || !session) {
      return reply.status(401).clearCookie('session_token').send({
        error: 'Invalid or expired session',
      });
    }

    request.user = {
      id: session.userId,
      sessionId: session.id,
    };
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Authentication error' });
  }
};
