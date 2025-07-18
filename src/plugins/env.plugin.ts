import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import fs from 'fs';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: string;
      PORT: number;
      SQLITE_PATH: string;
    };
  }
}
function resolveEnvFile(env: string): string | undefined {
  const envFileMap: Record<string, string> = {
    test: '.env.test',
    development: '.env.dev',
    production: '.env',
  };

  const envFile = envFileMap[env] || '.env';
  const envPath = path.resolve(process.cwd(), envFile);
  return fs.existsSync(envPath) ? envPath : undefined;
}

const envPlugin: FastifyPluginAsync = async (fastify) => {
  const nodeEnv = process.env.NODE_ENV || 'dev';
  const envFile = resolveEnvFile(nodeEnv);

  if (envFile) {
    loadEnv({ path: envFile });
  } else {
    console.warn(`No .env file found for NODE_ENV=${nodeEnv}`);
  }

  const envConfig = {
    NODE_ENV: nodeEnv,
    PORT: parseInt(process.env.PORT || '3000', 10),
    SQLITE_PATH: process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'db.sqlite'),
  };

  fastify.decorate('config', envConfig);

  // Also add to process.env for compatibility
  process.env = {
    ...process.env,
    ...Object.fromEntries(Object.entries(envConfig).map(([key, value]) => [key, String(value)])),
  };
};

export default fp(envPlugin);
