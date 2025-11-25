import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Helper function to execute queries
export async function query<T = any>(query: string, params?: any[]): Promise<T[]> {
  return await sql(query, params) as T[];
}

// Helper function to execute a single query
export async function queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
  const results = await sql(query, params) as T[];
  return results[0] || null;
}
