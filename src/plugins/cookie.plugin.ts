import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import { FastifyPluginAsync } from 'fastify';

const cookiePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cookie, {
    secret: fastify.config.COOKIE_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    },
  });
};

export default fp(cookiePlugin, {
  name: 'cookie-plugin',
  dependencies: ['env-plugin'],
});
