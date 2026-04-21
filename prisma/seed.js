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
  console.log("Master data seeded successfully.");
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
