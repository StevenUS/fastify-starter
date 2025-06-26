import Database from 'better-sqlite3';
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely';
import { fileURLToPath } from 'url';
import path from 'path';
import fp from 'fastify-plugin';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPlugin = async (fastify) => {
    const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../db.sqlite');
    const db = new Kysely({
        dialect: new SqliteDialect({
            database: new Database(dbPath),
        }),
        plugins: [new CamelCasePlugin()],
    });
    fastify.decorate('db', db);
    fastify.addHook('onClose', async () => {
        await db.destroy();
    });
};
export default fp(dbPlugin);
//# sourceMappingURL=db.plugin.js.map