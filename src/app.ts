import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { FastifyServerOptions } from 'fastify';
import { fileURLToPath } from 'url';
import authPlugin from './plugins/auth.plugin.js';
import cookiePlugin from './plugins/cookie.plugin.js';
import dbPlugin from './plugins/db.plugin.js';
import envPlugin from './plugins/env.plugin.js';
import userServicePlugin from './plugins/user.plugin.js';
import authRoutes from './routes/auth.routes.js';
import root from './routes/root.js';
import userRoutes from './routes/user.routes.js';
import { AppFastifyInstance } from './types/app-fastify-instance.js';

// Create a Fastify instance with typed options
const app: AppFastifyInstance = Fastify({
  logger: true,
  disableRequestLogging: process.env.NODE_ENV === 'test',
} as FastifyServerOptions).withTypeProvider<TypeBoxTypeProvider>();

// Register plugins (order matters)
await app.register(envPlugin);
await app.register(dbPlugin);
await app.register(cookiePlugin);
await app.register(authPlugin);
await app.register(userServicePlugin);

// Register routes with type safety
app.register(root, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api' });
app.register(authRoutes, { prefix: '/api' });

// Health check endpoint with response type
app.get<{ Reply: { status: string } }>('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

// Start the server
const start = async (): Promise<void> => {
  try {
    const port = app.config.PORT;
    const address = await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', async (): Promise<void> => {
  await app.close();
  process.exit(0);
});

// Check if this file is being run directly (ESM style)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch(console.error);
}

export { app, start };
