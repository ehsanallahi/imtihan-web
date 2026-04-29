const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No connection string found!");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'ehsan@imtihan.com';
  console.log(`Elevating ${email} via adapter...`);
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'super_admin' },
  });
  
  console.log(`SUCCESS: User ${user.email} is now ${user.role}`);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
