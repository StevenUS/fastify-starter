import fp from 'fastify-plugin';
import { config } from 'dotenv';
import path from 'path';
config();
const envPlugin = async (fastify) => {
    const envConfig = {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT || '3000', 10),
        SQLITE_PATH: process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'db.sqlite'),
    };
    fastify.decorate('config', envConfig);
    process.env = {
        ...process.env,
        ...Object.fromEntries(Object.entries(envConfig).map(([key, value]) => [key, String(value)])),
    };
};
export default fp(envPlugin);
//# sourceMappingURL=env.plugin.js.map