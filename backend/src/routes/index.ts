import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { itemRoutes } from './items';

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { status: 'ok' };
  });

  fastify.get('/health', async () => {
    return { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  await fastify.register(authRoutes);
  await fastify.register(itemRoutes);
}
