import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { env } from './config/env';
import { registerRoutes } from './routes';

const fastify = Fastify({
  logger: env.isProduction ? true : false,
});

fastify.register(cors, {
  origin: env.isDevelopment ? ['http://localhost:5173', 'http://localhost:3000'] : true,
  credentials: true,
});

fastify.register(cookie, {
  secret: env.jwtSecret,
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
