'use server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export async function generateMcqsFromPdf(cloudinaryUrl) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent([
    {
      inlineData: {
        // Fetch PDF from Cloudinary and send to Gemini
        data: await fetch(cloudinaryUrl)
          .then(r => r.arrayBuffer())
          .then(b => Buffer.from(b).toString('base64')),
        mimeType: 'application/pdf'
      }
    },
    `Generate 20 MCQs from this chapter in JSON format:
    [{
      "question": "string",
      "option_a": "string",
      "option_b": "string",
      "option_c": "string",
      "option_d": "string",
      "correct_answer": "string",
      "explanation": "string",
      "difficulty": "string",
      "topic_tag": "string"
    }]
    Make sure to return ONLY valid JSON and focus on commonly tested Pakistan board exam concepts.`
  ])

  // Extract the text which could contain markdown code blocks
  const text = result.response.text()
  
  try {
    // Attempt to strip json markdown block if present before parsing
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Failed to parse JSON from Gemini:", text)
    throw new Error("Failed to parse generated MCQs")
  }
}
