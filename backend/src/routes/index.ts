import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { itemRoutes } from './items';
import { healthRoutes } from './health';

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { status: 'ok' };
  });

  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(itemRoutes);
}
