import pg from 'pg';

const { Pool } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl:
        process.env.DB_SSL === 'false'
          ? false
          : { rejectUnauthorized: false },
    })
  : null;

export async function checkDatabase() {
  if (!pool) {
    return {
      connected: false,
      configured: false,
      message: 'Chưa cấu hình DATABASE_URL trong backend/.env',
    };
  }

  try {
    const result = await pool.query('select now() as server_time');
    return {
      connected: true,
      configured: true,
      serverTime: result.rows[0].server_time,
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      message: error.message,
    };
  }
}
