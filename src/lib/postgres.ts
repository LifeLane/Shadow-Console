
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon's SSL
  },
});

export async function query<T>(sql: string, values?: any[]): Promise<T[]> {
  try {
    const { rows } = await pool.query(sql, values);
    return rows as T[];
  } catch (error) {
    console.error('PostgreSQL query error:', error);
    throw new Error('Database query failed.');
  }
}

export async function getClient() {
  return pool.connect();
}
