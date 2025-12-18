import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Read package.json version
const version = process.env.npm_package_version || '1.0.0';

export async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check
  fastify.get('/health', async (request, reply) => {
    return {
      ok: true,
      uptime: process.uptime(),
      version,
      timestamp: new Date().toISOString(),
    };
  });

  // Readiness check with DB
  fastify.get('/ready', async (request, reply) => {
    try {
      // Lightweight DB check with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('DB check timeout')), 5000);
      });

      const dbCheckPromise = db.execute(sql`SELECT 1`);

      await Promise.race([dbCheckPromise, timeoutPromise]);

      return {
        ok: true,
        uptime: process.uptime(),
        version,
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      request.log.error(error, 'Health check failed');
      return reply.code(503).send({
        ok: false,
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
