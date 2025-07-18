import { AppFastifyInstance } from '../types/app-fastify-instance.js';
import { GetUserParams, UserResponse, ErrorResponse } from '../schemas/user.schemas.js';

export default async function userRoutes(fastify: AppFastifyInstance) {
  fastify.get(
    '/user/:name',
    {
      // schemas for the user routes are defined in the src/schemas dir
      schema: {
        params: GetUserParams,
        response: {
          200: UserResponse,
          404: ErrorResponse,
        },
      },
    },
    // The request and reply types are inferred from our fastify-type-provider package
    async (request, reply) => {
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
        // format dates to ISO 8601 strings
        const { password, ...userWithoutPassword } = user;
        const userResponse = {
          ...userWithoutPassword,
          createdAt: userWithoutPassword.createdAt.toISOString(),
          disabledAt: userWithoutPassword.disabledAt
            ? userWithoutPassword.disabledAt.toISOString()
            : null,
        };
        return userResponse;
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
