
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Fields on textbookUpload:', Object.keys(prisma.textbookUpload));
  // We can't easily see relation names from the keys of the model object, 
  // but we can try to use them in a query and see if it fails.
  try {
    await prisma.textbookUpload.findMany({
      include: {
        subject: true,
        chapter: true,
      }
    });
    console.log('✅ subject and chapter found!');
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
