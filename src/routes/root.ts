import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async function root(fastify: FastifyInstance) {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/html').send('<html><body>Hello World</body></html>');
  });
}
