import Database from 'better-sqlite3';
import { FastifyPluginAsync } from 'fastify';
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely';
import { fileURLToPath } from 'url';
import path from 'path';
import { Database as DB } from '../types/database.js';
import fp from 'fastify-plugin';

// Get the current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../db.sqlite');

  const db = new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new Database(dbPath),
    }),
    plugins: [new CamelCasePlugin()],
  });

  // Decorate fastify instance with db
  fastify.decorate('db', db);

  // Close the database connection when the server shuts down
  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<DB>;
  }
}

export default fp(dbPlugin);
