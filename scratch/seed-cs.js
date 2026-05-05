const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cs = await prisma.subject.create({
    data: {
      name: 'Computer Science',
      nameUrdu: 'کمپیوٹر سائنس',
      grade: 'nine',
      board: 'federal',
      chapters: {
        create: [
          { name: 'Problem Solving', number: 1 },
          { name: 'Binary System', number: 2 },
          { name: 'Networks', number: 3 },
        ]
      }
    }
  });
  console.log('Created Subject:', cs);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
