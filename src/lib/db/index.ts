import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy database connection - only connects when actually used
let dbInstance: NeonHttpDatabase<typeof schema> | null = null;
let sqlInstance: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
    }
    sqlInstance = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sqlInstance, { schema });
  }
  return dbInstance;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop: string | symbol) {
    const instance = getDb();
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export * from './schema';
