import Fastify from 'fastify';
import root from './routes/root.js';
import { fileURLToPath } from 'url';
import envPlugin from './plugins/env.plugin.js';
import dbPlugin from './plugins/db.plugin.js';
import userServicePlugin from './plugins/user.plugin.js';
import userRoutes from './routes/userRoutes.js';
const app = Fastify({
    logger: true,
    disableRequestLogging: process.env.NODE_ENV === 'test',
});
await app.register(envPlugin);
await app.register(dbPlugin);
await app.register(userServicePlugin);
app.register(root, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api' });
app.get('/health', async (_request, _reply) => {
    return { status: 'ok' };
});
const start = async () => {
    try {
        const port = app.config.PORT;
        const address = await app.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening at ${address}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
});
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    start().catch(console.error);
}
export { app, start };
//# sourceMappingURL=app.js.map