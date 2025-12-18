import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Sign up
  fastify.post('/auth/signup', async (request, reply) => {
    try {
      const body = signUpSchema.parse(request.body);

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, body.email));
      if (existingUser.length > 0) {
        return reply.code(400).send({ error: 'Email already registered' });
      }

      // Create user
      const passwordHash = await hashPassword(body.password);
      const [newUser] = await db.insert(users).values({
        email: body.email,
        passwordHash,
      }).returning();

      // Generate token
      const token = generateToken(newUser.id);

      // Set httpOnly cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return { 
        user: { 
          id: newUser.id, 
          email: newUser.email 
        } 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues[0].message });
      }
      console.error('Sign up error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Sign in
  fastify.post('/auth/signin', async (request, reply) => {
    try {
      const body = signInSchema.parse(request.body);

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, body.email));
      if (!user) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValid = await verifyPassword(body.password, user.passwordHash);
      if (!isValid) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user.id);

      // Set httpOnly cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return { 
        user: { 
          id: user.id, 
          email: user.email 
        } 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues[0].message });
      }
      console.error('Sign in error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Sign out
  fastify.post('/auth/signout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { message: 'Signed out successfully' };
  });

  // Get current user (protected)
  fastify.get('/auth/me', { preHandler: authMiddleware }, async (request: AuthRequest, reply) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, request.userId!));
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return { 
        user: { 
          id: user.id, 
          email: user.email 
        } 
      };
    } catch (error) {
      console.error('Get user error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
