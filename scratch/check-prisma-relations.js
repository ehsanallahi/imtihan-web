
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const connectionString = "postgresql://postgres.mjudrbdiiwkznzqkfvyx:rfCVQGyNBXmMXuwC@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    const res = await prisma.textbookUpload.findMany({
      include: {
        subject: true,
        chapter: true,
      },
      take: 1
    });
    console.log('✅ Success! Found relations.');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
