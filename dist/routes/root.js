export default async function root(fastify) {
    fastify.get('/', async (_request, reply) => {
        reply.type('text/html').send('<html><body>Hello World</body></html>');
    });
}
//# sourceMappingURL=root.js.map