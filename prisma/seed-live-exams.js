const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    const subject = await prisma.subject.findFirst();
    if (!subject) {
      console.error("No subject found to link live exam. Run standard seed first.");
      return;
    }

    const now = new Date();
    
    // 1. An exam starting in 1 hour
    const startSoon = new Date(now.getTime() + (60 * 60 * 1000));
    const endSoon = new Date(startSoon.getTime() + (60 * 60 * 1000));

    // 2. An exam currently live
    const startLive = new Date(now.getTime() - (30 * 60 * 1000));
    const endLive = new Date(startLive.getTime() + (60 * 60 * 1000));

    await prisma.liveExam.createMany({
      data: [
        {
          id: 'cl_soon_1',
          title: 'National Mathematics Mock Exam',
          subjectId: subject.id,
          startTime: startSoon,
          endTime: endSoon,
          durationMinutes: 60,
          totalQuestions: 50,
          isPublished: true
        },
        {
          id: 'cl_live_1',
          title: 'Physics Grand Competition',
          subjectId: subject.id,
          startTime: startLive,
          endTime: endLive,
          durationMinutes: 45,
          totalQuestions: 40,
          isPublished: true
        }
      ],
      skipDuplicates: true
    });

    console.log("Seed complete: 2 Live Exams created.");
  } catch (err) {
    console.error("SEED_ERROR:", err);
  }
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
