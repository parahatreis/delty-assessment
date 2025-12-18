import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', async () => {
    const allUsers = await db.select().from(users);
    return allUsers;
  });
}
