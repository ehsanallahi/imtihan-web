require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  
  try {
    const res = await pool.query(`
      SELECT
        relname as table_name,
        relrowsecurity as rls_enabled
      FROM
        pg_class
      JOIN
        pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE
        nspname = 'public'
        AND relkind = 'r'
      ORDER BY table_name;
    `);
    console.table(res.rows);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
