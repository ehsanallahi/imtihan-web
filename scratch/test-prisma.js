// We need to use ES modules or a tool that can load them.
// But we can try to mock the setup.
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('Using connection string:', connectionString ? 'FOUND' : 'MISSING');
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    const mcqCount = await prisma.mCQ.count();
    console.log('MCQ count:', mcqCount);
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
