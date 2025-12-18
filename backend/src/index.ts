import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { registerRoutes } from './routes';
import { randomUUID } from 'crypto';

const fastify = Fastify({
  logger: {
    level: env.isDevelopment ? 'info' : 'warn',
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          headers: {
            'x-request-id': req.headers['x-request-id'],
          },
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  },
  requestIdLogLabel: 'requestId',
  genReqId: (req) => {
    return req.headers['x-request-id']?.toString() || randomUUID();
  },
});

// Add request ID to response headers and track start time
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('x-request-id', request.id);
  (request as any).startTime = Date.now();
});

// Log response time
fastify.addHook('onResponse', async (request, reply) => {
  const responseTime = Date.now() - ((request as any).startTime || Date.now());
  request.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: `${responseTime}ms`,
  }, 'Request completed');
});

fastify.register(cors, {
  origin: env.isDevelopment ? ['http://localhost:5173', 'http://localhost:3000'] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.register(cookie, {
  secret: env.jwtSecret,
});

fastify.register(rateLimit, {
  global: false,
});

fastify.register(registerRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await fastify.listen({ port: env.port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${env.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
