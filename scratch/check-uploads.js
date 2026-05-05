const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const uploads = await prisma.textbookUpload.findMany({
    include: {
      _count: {
        select: { mcqs: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent Uploads:', JSON.stringify(uploads, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
