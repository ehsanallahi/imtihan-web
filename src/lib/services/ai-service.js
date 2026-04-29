import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const flashModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Generates MCQs from provided textbook text using Gemini.
 * @param {string} text - The textbook content.
 * @param {number} count - Number of questions to generate.
 * @returns {Promise<Array>} - List of generated MCQs.
 */
export async function generateMCQsFromText(text, count = 10) {
  const model = flashModel;

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
    const mcqs = JSON.parse(jsonString);

    // Validate Urdu content
    const urduRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    mcqs.forEach((mcq, index) => {
      const hasUrduInQuestion = urduRegex.test(mcq.questionTextUrdu);
      const hasUrduInExplanation = urduRegex.test(mcq.explanationUrdu);
      const hasUrduInOptions = mcq.options.every(opt => urduRegex.test(opt.textUrdu));

      if (!hasUrduInQuestion || !hasUrduInOptions) {
        console.warn(`[AI_VALIDATION_WARNING]: MCQ at index ${index} is missing Urdu characters.`);
      }
    });

    return mcqs;
  } catch (error) {
    console.error("[GEMINI_AI_ERROR]:", error);
    throw new Error("Failed to generate MCQs with AI");
  }
}

/**
 * Extracts and separates chapters from a full textbook PDF text using Gemini AI.
 * @param {string} fullText - The full extracted text of the textbook.
 * @param {Array<{id: string, number: number, name: string}>} existingChapters - Chapters already in DB for the subject.
 * @returns {Promise<Array<{chapterNumber, chapterName, chapterText, matchedChapterId}>>}
 */
export async function extractChaptersFromText(fullText, existingChapters = []) {
  const chaptersContext = existingChapters
    .map((c) => `Chapter ${c.number}: ${c.name} (id: ${c.id})`)
    .join("\n");

  const prompt = `
You are an expert educational content analyst. Your task is to identify and separate chapters from a full textbook.

Full Textbook Text (first 80,000 characters):
---
${fullText.substring(0, 80000)}
---

Existing chapters in our database for this subject:
${chaptersContext || "(none provided)"}

INSTRUCTIONS:
1. Identify all chapter boundaries in the text. Look for headings like "Chapter 1", "CHAPTER ONE", "Unit 1", "باب اول", numbered sections, etc.
2. For each chapter found, extract its content (the text belonging to that chapter until the next chapter starts).
3. Match each detected chapter to one of the existing chapters using the chapter number.
4. If a chapter cannot be matched to an existing chapter, still include it but set matchedChapterId to null.
5. Return ONLY a strict JSON array. No markdown, no extra text.

JSON format:
[
  {
    "chapterNumber": 1,
    "chapterName": "Detected Chapter Name",
    "chapterText": "Chapter text content (first 5000 chars max per chapter)",
    "matchedChapterId": "db-chapter-id-or-null"
  }
]

JSON OUTPUT:
`;

  try {
    const result = await flashModel.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const chapters = JSON.parse(jsonString);
    return Array.isArray(chapters) ? chapters : [];
  } catch (error) {
    console.error("[CHAPTER_EXTRACTION_ERROR]:", error);
    throw new Error("Failed to extract chapters from PDF with AI");
  }
}

/**
 * Converts a Google Drive shareable link to a direct download link.
 * Also passes through other URLs unchanged.
 * @param {string} url
 * @returns {string}
 */
export function normalizeGoogleDriveUrl(url) {
  // Pattern: https://drive.google.com/file/d/FILE_ID/view?...
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  // Dropbox: change ?dl=0 to ?dl=1
  if (url.includes("dropbox.com") && url.includes("dl=0")) {
    return url.replace("dl=0", "dl=1");
  }
  return url;
}

// ─── Past Paper MCQ Bank ─────────────────────────────────────────────────────

/**
 * Uses Gemini to auto-detect a past paper's metadata from its text and filename.
 * @param {string} text - Extracted PDF text
 * @param {string} filename - Original filename
 * @param {Buffer} buffer - Optional PDF buffer for multimodal detection
 * @returns {Promise<{board, grade, year, subjectName, medium}>}
 */
export async function extractPastPaperMetadata(text, filename = "", buffer = null) {
  const parts = [
    { text: `Analyze the filename and text to detect this paper's metadata.
    
    Filename: "${filename}"
    PDF Text (first 3000 characters):
    ---
    ${text.substring(0, 3000)}
    ---
    
    Rules:
    - board: must be one of: punjab, sindh, kpk, federal, aku, private
    - grade: must be one of: nine, ten, eleven, twelve
    - year: 4-digit number
    - subjectName: the subject name in English
    - medium: "english" or "urdu"
    
    Return ONLY a strict JSON object.` }
  ];

  if (buffer && text.length < 200) {
    parts.push({
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "application/pdf"
      }
    });
  }

  try {
    const result = await flashModel.generateContent(parts);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("[METADATA_EXTRACT_ERROR]:", error);
    return { board: null, grade: null, year: null, subjectName: null, medium: "english" };
  }
}

/**
 * Extracts every MCQ found in a past paper PDF text/buffer using Gemini.
 * @param {string} text - Full extracted PDF text
 * @param {string} medium - "english" | "urdu"
 * @param {Buffer} buffer - Optional PDF buffer for multimodal extraction
 * @returns {Promise<Array>}
 */
export async function extractMCQsFromPastPaper(text, medium = "english", buffer = null) {
  const parts = [
    { text: `Your task is to EXTRACT every multiple-choice question (MCQ) from the following past paper.
    
    Medium: ${medium}
    
    Text content:
    ---
    ${text.substring(0, 50000)}
    ---
    
    INSTRUCTIONS:
    1. Find every MCQ.
    2. Extract: question, questionUrdu, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D), explanation.
    3. Return ONLY a strict JSON array.` }
  ];

  if (buffer && text.length < 500) {
    parts.push({
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "application/pdf"
      }
    });
  }

  try {
    const result = await flashModel.generateContent(parts);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const mcqs = JSON.parse(jsonString);
    return Array.isArray(mcqs) ? mcqs : [];
  } catch (error) {
    console.error("[PAST_PAPER_MCQ_EXTRACT_ERROR]:", error);
    throw new Error("Failed to extract MCQs from past paper");
  }
}
