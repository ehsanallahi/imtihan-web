'use server'

import { proModel } from '@/lib/gemini'
import { db } from '@/lib/db'
import { authorize } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to generate a deep AI explanation for a textbook chapter.
 * Uses Gemini Pro for better reasoning and grounded summaries.
 */
export async function generateExplanationAction(textbookUploadId) {
  try {
    // 1. Authorize
    const authResult = await authorize("textbook_upload", "write")
    if (authResult.error) throw new Error(authResult.error)

    // 2. Fetch Upload Record
    const upload = await db.textbookUpload.findUnique({
      where: { id: textbookUploadId },
      include: { subject: true, chapter: true }
    })

    if (!upload || !upload.cloudinaryUrl) {
      throw new Error("Textbook upload record not found or missing URL")
    }

    // 3. Prepare Prompt
    const systemInstruction = `
      You are an expert academic tutor specializing in Pakistani board curriculum (9th-12th grade).
      Your goal is to provide a comprehensive, deep explanation of the provided textbook chapter.
      
      STRUCTURE YOUR RESPONSE USING MARKDOWN:
      1. **Chapter Overview**: A concise summary of what this chapter covers.
      2. **Core Concepts**: Identify the 3-5 most important concepts. For each, provide a clear, simplified explanation.
      3. **Key Terms & Definitions**: A list of technical terms used in the chapter with their meanings.
      4. **Bilingual Note**: Provide Urdu translations for key headings and technical terms where appropriate.
      5. **Quick Reference**: A bulleted list of "Must-Know" facts for exams.
      
      TONE: Encouraging, educational, and clear. Avoid fluff. Focus on "Grounding"—only use information found in the PDF.
    `

    // 4. Fetch PDF and Call Gemini Pro
    const pdfResponse = await fetch(upload.cloudinaryUrl)
    if (!pdfResponse.ok) throw new Error("Failed to download PDF")
    
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    // Helper for exponential backoff
    const retryWithBackoff = async (fn, maxRetries = 5, initialDelay = 5000) => {
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          const isRetryable = error.status === 503 || error.message?.includes('503') || error.message?.includes('high demand');
          if (isRetryable && i < maxRetries - 1) {
            const delay = initialDelay * Math.pow(2, i);
            console.warn(`[EXPLANATION_AI_RETRY]: Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    };

    const result = await retryWithBackoff(() => 
      proModel.generateContent([
        {
          inlineData: {
            data: base64Pdf,
            mimeType: 'application/pdf'
          }
        },
        systemInstruction,
        "Generate a deep explanation of this chapter according to the system instructions."
      ])
    )

    const explanation = result.response.text()

    // 5. Update Database
    await db.textbookUpload.update({
      where: { id: upload.id },
      data: {
        aiExplanation: explanation,
        explanationGenerated: true
      }
    })

    revalidatePath(`/dashboard/content/${upload.id}`)
    revalidatePath('/dashboard/content')

    return { 
      success: true, 
      message: "Deep AI explanation generated successfully!" 
    }

  } catch (error) {
    console.error("[GENERATE_EXPLANATION_ERROR]:", error)
    return { 
      success: false, 
      error: error.message || "Failed to generate explanation" 
    }
  }
}
