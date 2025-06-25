import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import root from './routes/root.js';
import { fileURLToPath } from 'url';

// Create a Fastify instance with typed options
const app: FastifyInstance = Fastify({
  logger: true,
  disableRequestLogging: process.env.NODE_ENV === 'test',
} as FastifyServerOptions);

// Register routes with type safety
app.register(root, { prefix: '/api' });

// Health check endpoint with response type
app.get<{ Reply: { status: string } }>('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

// Start the server
const start = async (): Promise<void> => {
  try {
    const port = Number(process.env.PORT) || 3000;
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
