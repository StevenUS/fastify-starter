import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
config();

// Define your environment variables
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: string;
      PORT: number;
      SQLITE_PATH: string;
      COOKIE_SECRET: string;
    };
  }
}

const envPlugin: FastifyPluginAsync = async (fastify) => {
  // Set default values
  const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    SQLITE_PATH: process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'db.sqlite'),
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'default-secret',
  };

  // Decorate fastify with config
  fastify.decorate('config', envConfig);

  // Also add to process.env for compatibility
  process.env = {
    ...process.env,
    ...Object.fromEntries(Object.entries(envConfig).map(([key, value]) => [key, String(value)])),
  };
};

export default fp(envPlugin, { name: 'env-plugin' });
