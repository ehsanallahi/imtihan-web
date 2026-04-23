const { Pool } = require('pg');

async function testConn() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing!');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString });
  try {
    const client = await pool.connect();
    console.log('Connected to DB successfully');
    const res = await client.query('SELECT NOW()');
    console.log('DB Time:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConn();
