
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Generates MCQs from provided textbook text using Gemini.
 * @param {string} text - The textbook content.
 * @param {number} count - Number of questions to generate.
 * @returns {Promise<Array>} - List of generated MCQs.
 */
export async function generateMCQsFromText(text, count = 10) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert educationist. Generate ${count} multiple-choice questions (MCQs) from the following textbook content.
    
    CONTENT:
    ${text.substring(0, 30000)} // Limit context to 30k chars for efficiency
    
    REQUIREMENTS:
    1. Each question must have 4 options (A, B, C, D).
    2. Exactly one option must be correct.
    3. Provide a clear explanation for the correct answer.
    4. provide the output in strict JSON format as an array of objects.
    5. Each object MUST have these fields:
       - questionText (English)
       - questionTextUrdu (Urdu translation)
       - options: an array of 4 objects { text, textUrdu, isCorrect (boolean) }
       - explanation (English)
       - explanationUrdu (Urdu translation)
       
    The Urdu translation must be grammatically correct and appropriate for a textbook.
    
    JSON OUTPUT:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Clean JSON response (remove markdown code blocks if any)
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("[GEMINI_AI_ERROR]:", error);
    throw new Error("Failed to generate MCQs with AI");
  }
}
