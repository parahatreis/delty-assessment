import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../config/env';

async function runMigrations() {
  const migrationClient = postgres(env.databaseUrl, {
    max: 1,
    ssl: 'require',
    connect_timeout: 10,
  });
  
  const db = drizzle(migrationClient);
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
