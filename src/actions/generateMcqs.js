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
  if (!pdfResponse.ok) {
    throw new Error(`Failed to download PDF from Cloudinary: ${pdfResponse.status} ${pdfResponse.statusText}`)
  }
  const pdfBuffer = await pdfResponse.arrayBuffer()
  const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

  const prompt = `Generate 20 MCQs based on the attached chapter PDF content. Follow the system instructions strictly.`

  // Helper for exponential backoff to handle temporary AI outages
  const retryWithBackoff = async (fn, maxRetries = 5, initialDelay = 5000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isRetryable = error.status === 503 || 
                            error.message?.includes('503') || 
                            error.message?.includes('high demand');
        
        if (isRetryable && i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          console.warn(`[AI_RETRY]: Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  };

  const result = await retryWithBackoff(() => 
    flashModel.generateContent([
      {
        inlineData: {
          data: base64Pdf,
          mimeType: 'application/pdf'
        }
      },
      systemInstruction,
      prompt
    ])
  );

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

  const savedCount = await db.mCQ.createMany({
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
