const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Ensure we load environment variables, prioritizing .env.local
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Seed Admin User
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@imtihan.com" },
    update: {
      hashedPassword: hashedPassword,
    },
    create: {
      email: "admin@imtihan.com",
      name: "Admin User",
      hashedPassword: hashedPassword,
      role: "super_admin",
    },
  });

  console.log("Admin user seeded:", admin.email);

  // 1.1 Seed Student User
  const student = await prisma.user.upsert({
    where: { email: "student@imtihan.com" },
    update: {
      hashedPassword: hashedPassword,
    },
    create: {
      email: "student@imtihan.com",
      name: "Student User",
      hashedPassword: hashedPassword,
      role: "student",
    },
  });

  console.log("Student user seeded:", student.email);

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      grade: "nine",
      board: "punjab",
      studyStreak: 3,
    },
    create: {
      userId: student.id,
      grade: "nine",
      board: "punjab",
      studyStreak: 3,
    }
  });

  console.log("Student profile seeded.");

  // 2. Seed Casbin Rules from CSV
  const policyPath = path.join(process.cwd(), "src/lib/casbin-policy.csv");
  if (fs.existsSync(policyPath)) {
    const fileContent = fs.readFileSync(policyPath, "utf-8");
    const lines = fileContent.split("\n").filter(line => line.trim() !== "");
    
    console.log(`Found ${lines.length} policy lines in CSV. Migrating to database...`);
    
    // Clear existing rules to avoid duplicates on re-seed
    await prisma.casbinRule.deleteMany({});
    
    for (const line of lines) {
      const [ptype, v0, v1, v2, v3, v4, v5] = line.split(",").map(s => s.trim());
      
      await prisma.casbinRule.create({
        data: {
          ptype,
          v0,
          v1,
          v2,
          v3,
          v4,
          v5
        }
      });
    }
    console.log("Casbin rules synced successfully.");
  } else {
    console.warn("Casbin policy CSV not found at:", policyPath);
  }

  // 3. Seed Master Data (Subjects & Chapters)
  console.log("Seeding Master Data (Subjects & Chapters)...");
  
  const subjects = [
    { name: "Biology", nameUrdu: "حیاتیات", grade: "nine", board: "punjab" },
    { name: "Physics", nameUrdu: "طبعیات", grade: "nine", board: "punjab" },
    { name: "Chemistry", nameUrdu: "کیمیاء", grade: "nine", board: "punjab" },
    { name: "Mathematics", nameUrdu: "ریاضی", grade: "nine", board: "punjab" },
  ];

  for (const s of subjects) {
    const subject = await prisma.subject.upsert({
      where: { 
        // We'll use a combination of name, grade, and board to uniquely identify subjects for upsert
        // Since we don't have a unique constraint on these in schema, we'll search first
        id: (await prisma.subject.findFirst({ 
          where: { name: s.name, grade: s.grade, board: s.board } 
        }))?.id || 'new-subject'
      },
      update: {
        nameUrdu: s.nameUrdu,
      },
      create: {
        name: s.name,
        nameUrdu: s.nameUrdu,
        grade: s.grade,
        board: s.board,
      },
    });

    // Seed Chapter samples for Biology
    if (s.name === "Biology") {
      const bioChapters = [
        { name: "Introduction to Biology", number: 1 },
        { name: "Solving a Biological Problem", number: 2 },
        { name: "Biodiversity", number: 3 },
      ];

      for (const ch of bioChapters) {
        await prisma.chapter.upsert({
          where: {
            id: (await prisma.chapter.findFirst({
              where: { name: ch.name, subjectId: subject.id }
            }))?.id || 'new-chapter'
          },
          update: {},
          create: {
            name: ch.name,
            number: ch.number,
            subjectId: subject.id,
          }
        });
      }
    }
  }
  // 3.5 Seed Achievements
  console.log("Seeding Achievements...");
  const defaultAchievements = [
    { title: "First Steps", description: "Complete your first practice quiz.", criteria: "1_quiz_completed", badgeUrl: "first_steps" },
    { title: "Centurion", description: "Answer 100 MCQs correctly.", criteria: "100_mcqs_correct", badgeUrl: "centurion" },
    { title: "Flawless Victory", description: "Score 100% on any practice quiz.", criteria: "100_percent_score", badgeUrl: "flawless" },
    { title: "Week Warrior", description: "Maintain a 7-day study streak.", criteria: "7_day_streak", badgeUrl: "week_warrior" },
    { title: "Month Master", description: "Maintain a 30-day study streak.", criteria: "30_day_streak", badgeUrl: "month_master" },
    { title: "Early Bird", description: "Complete a study session before 8 AM.", criteria: "early_bird", badgeUrl: "early_bird" },
    { title: "Night Owl", description: "Complete a study session after 10 PM.", criteria: "night_owl", badgeUrl: "night_owl" },
    { title: "Subject Master", description: "Score 90% or higher on a full Subject Mock Exam.", criteria: "subject_master", badgeUrl: "subject_master" },
    { title: "Review Champion", description: "Clear your Daily Review queue 5 times.", criteria: "5_reviews_cleared", badgeUrl: "review_champion" },
  ];

  for (const ach of defaultAchievements) {
    await prisma.achievement.upsert({
      where: { id: (await prisma.achievement.findFirst({ where: { criteria: ach.criteria } }))?.id || 'new-ach' },
      update: { title: ach.title, description: ach.description, badgeUrl: ach.badgeUrl },
      create: { title: ach.title, description: ach.description, criteria: ach.criteria, badgeUrl: ach.badgeUrl },
    });
  }
  // 4. Seed Mock Subscription Data for Admin Dashboard
  console.log("Seeding Mock Subscriptions...");
  const plans = ["student_monthly", "student_yearly", "institution_yearly"];
  for (let i = 0; i < 15; i++) {
    const randomPlan = plans[Math.floor(Math.random() * plans.length)];
    let amount = randomPlan === "student_monthly" ? 1000 : randomPlan === "student_yearly" ? 10000 : 50000;
    
    await prisma.subscription.create({
      data: {
        userId: student.id,
        plan: randomPlan,
        status: "active",
        amountPkr: amount,
        startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
      }
    });
  }

  // 5. Seed Mock AI Usage Data for Admin Dashboard
  console.log("Seeding Mock AI Usage...");
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    await prisma.aiUsage.upsert({
      where: {
        userId_date: {
          userId: student.id,
          date: d,
        }
      },
      update: {
        count: Math.floor(Math.random() * 50) + 10,
      },
      create: {
        userId: student.id,
        date: d,
        count: Math.floor(Math.random() * 50) + 10,
      }
    });
  }

  console.log("Master data and mock data seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
