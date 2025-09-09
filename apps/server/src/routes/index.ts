import { FastifyInstance } from 'fastify';
import { initRoutes as initOAuthRoutes } from './oauth';
import { initRoutes as initGroupRoutes } from './groups';

export async function initRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Регистрируем маршруты
  await fastify.register(initOAuthRoutes, { prefix: '/oauth' });
  await fastify.register(initGroupRoutes, { prefix: '/groups' });
}
