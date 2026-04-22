require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifyGeneration() {
  const uploadId = 'cmo8l54ft00004wv4wo7wilz9';
  console.log('Testing AI generation for upload:', uploadId);

  const upload = await prisma.textbookUpload.findUnique({
    where: { id: uploadId }
  });

  if (!upload) {
    console.error('Upload not found');
    process.exit(1);
  }

  const systemInstruction = `
    You are an expert examiner for Pakistani boards. 
    Generate 3 high-quality MCQs (reduced count for testing) from the PDF.
    Output MUST be a valid JSON array.
    JSON SCHEMA:
    {
      "question": "string",
      "questionUrdu": "string",
      "optionA": "string",
      "optionB": "string",
      "optionC": "string",
      "optionD": "string",
      "correctAnswer": "A|B|C|D",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "topicTag": "string"
    }
  `;

  console.log('Fetching PDF...');
  const pdfResponse = await fetch(upload.cloudinaryUrl);
  const pdfBuffer = await pdfResponse.arrayBuffer();
  const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

  console.log('Sending to Gemini...');
  const result = await flashModel.generateContent([
    {
      inlineData: {
        data: base64Pdf,
        mimeType: 'application/pdf'
      }
    },
    systemInstruction,
    "Generate 3 MCQs."
  ]);

  const responseText = result.response.text();
  console.log('Gemini Response:', responseText);

  try {
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const mcqs = JSON.parse(cleanedJson);
    console.log('Parsed successfully! Found', mcqs.length, 'MCQs.');

    console.log('Sample MCQ 1 Urdu:', mcqs[0].questionUrdu);
    
    // Cleanup - delete the test upload
    // await prisma.textbookUpload.delete({ where: { id: uploadId } });
    
    process.exit(0);
  } catch (e) {
    console.error('Failed to parse or process:', e);
    process.exit(1);
  }
}

verifyGeneration();
