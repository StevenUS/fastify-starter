import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// Define the request schema
const getUserSchema = {
  params: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: '^[a-zA-Z0-9_]+$', // Only allow alphanumeric and underscore
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        disabledAt: { type: ['string', 'null'], format: 'date-time' },
      },
    },
    404: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: { name: string };
  }>(
    '/user/:name',
    { schema: getUserSchema },
    async (request: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) => {
      try {
        const { name } = request.params;
        console.log(name);
        const user = await fastify.userService.findUserByName(request.params.name);

        if (!user) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'User not found',
          });
        }

        // Don't return the password hash
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An error occurred while fetching the user',
        });
      }
    },
  );
}
