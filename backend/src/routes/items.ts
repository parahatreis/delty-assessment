import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { items } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const updateItemSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  pageSize: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

export async function itemRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Get all items for current user with pagination
  fastify.get('/items', async (request: AuthRequest, reply) => {
    try {
      const query = querySchema.parse(request.query);
      const page = query.page;
      const pageSize = Math.min(query.pageSize, 100); // Max 100 items per page
      const offset = (page - 1) * pageSize;

      const userItems = await db
        .select()
        .from(items)
        .where(eq(items.userId, request.userId!))
        .orderBy(desc(items.createdAt))
        .limit(pageSize)
        .offset(offset);

      // Get total count for pagination
      const countResult = await db
        .select({ count: count() })
        .from(items)
        .where(eq(items.userId, request.userId!));

      const totalCount = countResult[0]?.count || 0;

      return {
        items: userItems,
        pagination: {
          page,
          pageSize,
          total: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / pageSize),
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues[0].message });
      }
      console.error('Get items error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get single item
  fastify.get('/items/:id', async (request: AuthRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const itemId = parseInt(id);

      const [item] = await db
        .select()
        .from(items)
        .where(and(eq(items.id, itemId), eq(items.userId, request.userId!)));

      if (!item) {
        return reply.code(404).send({ error: 'Item not found' });
      }

      return { item };
    } catch (error) {
      console.error('Get item error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create item
  fastify.post('/items', async (request: AuthRequest, reply) => {
    try {
      const body = createItemSchema.parse(request.body);

      const [newItem] = await db
        .insert(items)
        .values({
          ...body,
          userId: request.userId!,
        })
        .returning();

      return reply.code(201).send({ item: newItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues[0].message });
      }
      console.error('Create item error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update item
  fastify.patch('/items/:id', async (request: AuthRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const itemId = parseInt(id);
      const body = updateItemSchema.parse(request.body);

      // Check if item exists and belongs to user
      const [existingItem] = await db
        .select()
        .from(items)
        .where(and(eq(items.id, itemId), eq(items.userId, request.userId!)));

      if (!existingItem) {
        return reply.code(404).send({ error: 'Item not found' });
      }

      const [updatedItem] = await db
        .update(items)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(items.id, itemId))
        .returning();

      return { item: updatedItem };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.issues[0].message });
      }
      console.error('Update item error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete item
  fastify.delete('/items/:id', async (request: AuthRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const itemId = parseInt(id);

      // Check if item exists and belongs to user
      const [existingItem] = await db
        .select()
        .from(items)
        .where(and(eq(items.id, itemId), eq(items.userId, request.userId!)));

      if (!existingItem) {
        return reply.code(404).send({ error: 'Item not found' });
      }

      await db.delete(items).where(eq(items.id, itemId));

      return { message: 'Item deleted successfully' };
    } catch (error) {
      console.error('Delete item error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
