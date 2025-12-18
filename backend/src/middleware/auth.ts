import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends FastifyRequest {
  userId?: number;
}

export async function authMiddleware(request: AuthRequest, reply: FastifyReply) {
  try {
    const token = request.cookies.token;

    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { userId: number };
    request.userId = decoded.userId;
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
