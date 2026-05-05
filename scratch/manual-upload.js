const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { v2: cloudinary } = require('cloudinary');

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function run() {
  try {
    const { extractTextFromPDF, cleanExtractedText } = await import('../src/lib/pdf-utils.js');
    const { extractPastPaperMetadata, extractMCQsFromPastPaper } = await import('../src/lib/services/ai-service.js');

    const filePath = path.join(__dirname, '../assets/Computer-9 (BWP-24).pdf');
    const originalName = 'Computer-9 (BWP-24).pdf';
    
    console.log(`Reading file: ${filePath}...`);
    const fileBuffer = fs.readFileSync(filePath);

    // 1. Extract text
    console.log("Extracting text...");
    const rawText = await extractTextFromPDF(fileBuffer);
    const cleanedText = cleanExtractedText(rawText);
    console.log(`Text extracted (${cleanedText.length} chars)`);

    // 2. Metadata detection
    console.log("Detecting metadata with Multimodal AI...");
    const metadata = await extractPastPaperMetadata(cleanedText, originalName, fileBuffer);
    console.log("Metadata detected:", metadata);

    // 3. Cloudinary Upload
    console.log("Uploading to Cloudinary...");
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "imtihan/past-papers",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });
    console.log("Cloudinary URL:", cloudinaryResult.secure_url);

    // 4. Find/Create Subject
    let subject = await db.subject.findFirst({
      where: {
        name: { contains: metadata.subjectName || "Computer Science", mode: "insensitive" },
        grade: metadata.grade || "nine",
      }
    });

    if (!subject) {
      console.log("Subject not found, using first available...");
      subject = await db.subject.findFirst();
    }

    // 5. Create Upload Record
    const user = await db.user.findFirst({ where: { role: 'super_admin' } });
    const upload = await db.pastPaperUpload.create({
      data: {
        originalName,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        board: metadata.board || "punjab",
        grade: metadata.grade || "nine",
        medium: metadata.medium || "english",
        year: metadata.year || 2024,
        subjectId: subject.id,
        uploadedById: user.id,
        isProcessed: false
      }
    });

    // 6. Extract MCQs
    console.log("Extracting MCQs with Multimodal AI...");
    const extractedMcqs = await extractMCQsFromPastPaper(cleanedText, metadata.medium || "english", fileBuffer);
    console.log(`Extracted ${extractedMcqs.length} MCQs`);

    // 7. Save to DB
    let newCount = 0;
    for (const item of extractedMcqs) {
      await db.pastPaperMCQ.create({
        data: {
          question: item.question || "",
          questionUrdu: item.questionUrdu || null,
          optionA: item.optionA || "",
          optionB: item.optionB || "",
          optionC: item.optionC || "",
          optionD: item.optionD || "",
          correctAnswer: item.correctAnswer || "A",
          explanation: item.explanation || null,
          board: upload.board,
          grade: upload.grade,
          medium: upload.medium,
          year: upload.year,
          subjectId: upload.subjectId,
          pastPaperUploadId: upload.id,
          repeatCount: 1,
          isApproved: true,
        }
      });
      newCount++;
    }

    await db.pastPaperUpload.update({
      where: { id: upload.id },
      data: { isProcessed: true }
    });

    console.log(`Done! Upload ID: ${upload.id}, MCQs: ${newCount}`);
  } catch (err) {
    console.error("FATAL ERROR:", err);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

run();
