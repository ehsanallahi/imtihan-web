const { Client } = require('pg');

const connectionString = "postgresql://postgres.mjudrbdiiwkznzqkfvyx:Ehsan17798@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({
  connectionString: connectionString,
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Query output:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

testConnection();
