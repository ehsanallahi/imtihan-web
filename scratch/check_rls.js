require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const result = await prisma.$queryRaw`
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
  `;
  console.table(result);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
