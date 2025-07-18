import { FastifyInstance } from 'fastify';
import { LoginParams } from '../types/auth.js';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '../config/constants.js';
import {
  ErrorResponse,
  LoginRequest,
  loginSchema,
  logoutSchema,
  RevokeSessionRequest,
  revokeSessionSchema,
  SessionRequest,
  sessionSchema,
  SessionsRequest,
  sessionsSchema,
  SuccessResponse,
} from '../schemas/auth.schemas.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // Login route
  fastify.post<LoginRequest>(
    '/auth/login',
    {
      schema: loginSchema,
    },
    async (request, reply) => {
      try {
        const { username, password } = request.body;
        const loginParams: LoginParams = {
          username,
          password,
          userAgent: request.headers['user-agent'] || null,
          ipAddress: request.ip,
        };
        const result = await fastify.authService.login(loginParams);

        // Set HTTP-only cookie, defaults will be used from cookie-plugin
        reply.setCookie(SESSION_COOKIE, result.token, {
          maxAge: SESSION_MAX_AGE, // 30 days
          expires: new Date(Date.now() + SESSION_MAX_AGE * 1000), // 30 days
        });

        return {
          userId: result.userId,
          expiresAt: new Date(result.expiresAt).toISOString(),
        };
      } catch (error) {
        request.log.error(error);
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid username or password',
        });
      }
    },
  );

  // Logout route
  fastify.post<{ Reply: SuccessResponse | ErrorResponse }>(
    '/auth/logout',
    {
      preValidation: [fastify.authenticate],
      schema: logoutSchema,
    },
    async (request, reply) => {
      try {
        const token = request.cookies.session_token;
        if (token) {
          await fastify.authService.logout(token);
        }

        // Clear the session cookie
        reply.clearCookie(SESSION_COOKIE);

        return { success: true };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An error occurred during logout',
        });
      }
    },
  );

  // Get current session
  fastify.get<SessionRequest>(
    '/auth/session',
    {
      preValidation: [fastify.authenticate],
      schema: sessionSchema,
    },
    async (request, reply) => {
      const token = request.cookies.session_token;
      if (!token) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'No session token provided',
        });
      }

      const { session } = await fastify.authService.validateSession(token);

      if (!session) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Session not found',
        });
      }

      return {
        sessionId: session.id,
        userId: session.userId,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
        isActive: !session.revokedAt && new Date(session.expiresAt) > new Date(),
      };
    },
  );

  // Get all active sessions for current user
  fastify.get<SessionsRequest>(
    '/auth/sessions',
    {
      preValidation: [fastify.authenticate],
      schema: sessionsSchema,
    },
    async (request) => {
      const user = request.user as { id: number; sessionId: number };
      return fastify.authService.getUserSessions(user.id, user.sessionId);
    },
  );

  // Revoke a specific session
  fastify.post<RevokeSessionRequest>(
    '/auth/sessions/revoke',
    {
      preValidation: [fastify.authenticate],
      schema: revokeSessionSchema,
    },
    async (request, reply) => {
      try {
        const { sessionId } = request.body;
        const user = request.user as { id: number; sessionId: number };

        // Verify the session belongs to the user
        const sessions = await fastify.authService.getUserSessions(user.id, sessionId);
        const session = sessions.find((s) => s.isCurrent);

        if (!session) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Session not found',
          });
        }

        await fastify.authService.revokeSession(sessionId.toString());
        return { success: true };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to revoke session',
        });
      }
    },
  );
}
