import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import root from './routes/root.js';
import { fileURLToPath } from 'url';
import envPlugin from './plugins/env.plugin.js';
import dbPlugin from './plugins/db.plugin.js';
import userServicePlugin from './plugins/user.plugin.js';
import userRoutes from './routes/userRoutes.js';

// Create a Fastify instance with typed options
const app: FastifyInstance = Fastify({
  logger: true,
  disableRequestLogging: process.env.NODE_ENV === 'test',
} as FastifyServerOptions);

// Register plugins (order matters)
await app.register(envPlugin);
await app.register(dbPlugin);
await app.register(userServicePlugin);

// Register routes with type safety
app.register(root, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api' });

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
