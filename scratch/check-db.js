const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany();
  console.log('Subjects:', subjects);
  const chapters = await prisma.chapter.findMany();
  console.log('Chapters:', chapters);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
