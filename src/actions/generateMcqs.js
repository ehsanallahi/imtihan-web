'use server'

import { flashModel } from '@/lib/gemini'
import { db } from '@/lib/db'
import { authorize } from '@/lib/auth-guards'

/**
 * Server Action to generate MCQs from a textbook chapter PDF using AI.
 * Results are automatically saved to the database.
 * 
 * @param {string} textbookUploadId - The ID of the TextbookUpload record to process.
 */
export async function generateMcqsAction(textbookUploadId) {
  // 1. Authorize
  const authResult = await authorize("textbook_upload", "write")
  if (authResult.error) {
    throw new Error(authResult.error)
  }
  const user = authResult.user

  // 2. Fetch Upload Record
  const upload = await db.textbookUpload.findUnique({
    where: { id: textbookUploadId },
    include: { chapter: true }
  })

  if (!upload || !upload.cloudinaryUrl) {
    throw new Error("Textbook upload record not found or missing URL")
  }

  // 3. Prepare Gemini Prompt
  const systemInstruction = `
    You are an expert examiner for Pakistani boards (Punjab, Federal, KPK, Sindh).
    Your task is to generate 20 high-quality Multiple Choice Questions (MCQs) from the provided textbook chapter PDF.
    
    RULES:
    1. Output MUST be a valid JSON array of objects.
    2. Each MCQ must be conceptually accurate and formatted for 9th-12th grade level.
    3. Include both English and Urdu translations for the question and all four options.
    4. Difficulty MUST be one of: "easy", "medium", "hard".
    5. correctAnswer MUST be exactly one of: "A", "B", "C", "D".
    6. Return ONLY the JSON data, no markdown formatting or extra text.
    
    JSON SCHEMA:
    {
      "question": "English question text",
      "questionUrdu": "اردو سوال",
      "optionA": "English Option A",
      "optionB": "English Option B",
      "optionC": "English Option C",
      "optionD": "English Option D",
      "correctAnswer": "A",
      "explanation": "Brief explanation in English",
      "difficulty": "medium",
      "topicTag": "topic name"
    }
  `;

  // 4. Trigger Gemini
  const pdfResponse = await fetch(upload.cloudinaryUrl)
  const pdfBuffer = await pdfResponse.arrayBuffer()
  const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

  const prompt = `Generate 20 MCQs based on the attached chapter PDF content. Follow the system instructions strictly.`

  const result = await flashModel.generateContent([
    {
      inlineData: {
        data: base64Pdf,
        mimeType: 'application/pdf'
      }
    },
    systemInstruction,
    prompt
  ])

  const responseText = result.response.text()
  
  // 5. Parse and Validate
  let generatedMcqs = []
  try {
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    generatedMcqs = JSON.parse(cleanedJson)
  } catch (error) {
    console.error("Gemini Response Parsing Failed:", responseText)
    throw new Error("AI failed to return valid MCQ format. Please try again.")
  }

  // 6. Save to Database
  const mcqData = generatedMcqs.map(mcq => ({
    question: mcq.question,
    questionUrdu: mcq.questionUrdu,
    optionA: mcq.optionA,
    optionB: mcq.optionB,
    optionC: mcq.optionC,
    optionD: mcq.optionD,
    correctAnswer: mcq.correctAnswer,
    explanation: mcq.explanation,
    difficulty: mcq.difficulty.toLowerCase(),
    topicTag: mcq.topicTag,
    subjectId: upload.subjectId || "",
    chapterId: upload.chapterId,
    textbookUploadId: upload.id,
    createdById: user.id,
    isAiGenerated: true,
    isApproved: true // Defaulted to true as per standard setup
  }))

  const savedCount = await db.mcq.createMany({
    data: mcqData
  })

  // 7. Update Upload Record
  await db.textbookUpload.update({
    where: { id: upload.id },
    data: { mcqsGenerated: true }
  })

  return { 
    success: true, 
    count: savedCount.count,
    message: `Successfully generated ${savedCount.count} MCQs for ${upload.originalName}`
  }
}
