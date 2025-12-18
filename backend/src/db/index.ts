import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as schema from './schema';

// Lazy initialization to prevent crashes on startup
let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    console.log('Connecting to database...');
    client = postgres(env.databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: env.isProduction ? 'require' : false,
    });
    dbInstance = drizzle(client, { schema });
    console.log('Database connection established');
  }
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});
