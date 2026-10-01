import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Create a single pool instance to be reused
let pool: Pool | null = null;

export const getDbPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in environment variables");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // For Supabase, ssl might be required depending on the setup, usually it is:
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
};

export const queryDatabase = async (text: string, params?: any[]) => {
  const dbPool = getDbPool();
  try {
    const start = Date.now();
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
