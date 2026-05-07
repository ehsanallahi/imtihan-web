require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  
  try {
    console.log("Enabling RLS on all public tables...");
    await pool.query(`
      DO $$ 
      DECLARE 
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
          END LOOP;
      END $$;
    `);
    console.log("RLS enabled successfully.");
    
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
