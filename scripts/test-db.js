const { Pool } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres.nkppjrpismvmgzhuotvw:bitsathyr10@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
  console.log('Connecting to:', connectionString);
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Success!', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
