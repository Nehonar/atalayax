import Fastify from 'fastify';

export function createServer() {
  const app = Fastify({
    logger: true,
  });

  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;

    if (origin) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Vary', 'Origin');
    }

    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return reply.status(204).send();
    }
  });

  return app;
}
