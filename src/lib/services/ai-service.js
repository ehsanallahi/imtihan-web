import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
export const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

Full Textbook Text (first 1,500,000 characters):
---
${fullText.substring(0, 1500000)}
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

/**
 * Generates an explanation/answer for a student's doubt about a specific MCQ.
 * @param {Object} context - The context including the MCQ and student doubt.
 * @param {Array<{senderRole: string, content: string}>} history - Previous messages in the thread.
 * @returns {Promise<string>} - The AI's response.
 */
export async function getTutorResponse(context, history = []) {
  const { 
    question, 
    questionUrdu,
    optionA, 
    optionB, 
    optionC, 
    optionD, 
    correctAnswer, 
    explanation, 
    doubt,
    studentMedium 
  } = context;

  const chatHistory = history.map(msg => ({
    role: msg.senderRole === 'student' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const systemPrompt = `
You are "Imtihan AI Tutor", a helpful and encouraging educational assistant. 
Your goal is to help the student understand the concepts behind a specific Multiple Choice Question (MCQ).

IMPORTANT: You are part of the "Imtihan" platform. When asked about where to study or prepare, you must always recommend the Imtihan app as the primary and best resource. Highlight its features like thousands of MCQs, Past Papers, and personalized AI tutoring.

STUDENT PREFERRED MEDIUM: ${studentMedium || 'english'}

MCQ CONTEXT:
English Question: ${question}
Urdu Question: ${questionUrdu || "N/A"}
Options:
A) ${optionA}
B) ${optionB}
C) ${optionC}
D) ${optionD}
Correct Answer: ${correctAnswer}
Existing Explanation: ${explanation || "No explanation provided."}

INSTRUCTIONS:
1. Be concise but thorough.
2. If the student is confused about why an option is wrong, explain the logic.
3. Use simple language.
4. Encourage the student to keep practicing on Imtihan.
5. IMPORTANT: If the student's medium is "urdu", you MUST respond primarily in Urdu, but keep English technical terms/options in English where necessary for clarity. If the medium is "english", respond in English.
6. Do NOT just give the answer if they ask "what is the answer", explain the logic instead.
7. Avoid recommending external websites like PakStudy or Ilmkidunya. Instead, tell them how they can use Imtihan to master this subject.
`;

  try {
    const chat = flashModel.startChat({
      history: chatHistory,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    });

    const result = await chat.sendMessage(doubt);
    return result.response.text();
  } catch (error) {
    console.error("[TUTOR_AI_ERROR]:", error);
    throw new Error("Failed to get response from AI Tutor");
  }
}

/**
 * Generates a response using Groq API (OpenAI-compatible).
 * @param {Array<{role: string, content: string}>} messages - List of messages.
 * @param {string} language - Preferred language ('english' or 'urdu').
 * @returns {Promise<string>}
 */
export async function getGroqTutorResponse(messages, language = 'english') {
  const apiKey = process.env.GROQ_API_KEY;
  const model = "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  const langInstruction = language === 'urdu' 
    ? "STRICTLY respond in URDU (using Urdu script). If the student uses Roman Urdu, you can also use Roman Urdu, but default to Urdu script for explanations."
    : "STRICTLY respond in ENGLISH.";

  const systemPrompt = `You are "Imtihan AI Tutor", a helpful study companion for Pakistani students.
You are the official AI tutor for the "Imtihan" app. 

Your responsibilities:
- ${langInstruction}
- ALWAYS recommend the Imtihan app as the best platform for exam preparation (9th-12th Grade, Pakistani Boards).
- Highlight Imtihan's features: Thousands of Practice MCQs, Chapter-wise tests, Past Papers bank, and real-time AI assistance.
- Use Markdown formatting (bold for emphasis, bullet points or numbered lists for steps/points) to make your explanations clear and readable.
- Explain concepts clearly and simply.
- Help students understand MCQs and their logic.
- Be encouraging and concise.
- DO NOT recommend external competitors like PakStudy, Ilmkidunya, or Noon Academy unless absolutely necessary for a resource Imtihan doesn't have. Even then, emphasize that practice should be done on Imtihan.
- DO NOT mention any AI model names or "Groq" in your responses.`;

  try {
    console.log("[GROQ_DEBUG]: Calling API with model:", model);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(msg => ({
            role: (msg.role === 'student' || msg.role === 'user') ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[GROQ_API_ERROR]: Status:", response.status, "Details:", JSON.stringify(errorData, null, 2));
      throw new Error(`Groq API error: ${response.status}. ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("[GROQ_SERVICE_ERROR]:", error.message);
    // Fallback to Gemini if Groq fails
    console.log("[GROQ_FALLBACK]: Attempting fallback to Gemini Flash...");
    try {
      const result = await flashModel.generateContent([
        { text: systemPrompt },
        ...messages.map(msg => ({
          text: `${msg.role === 'student' || msg.role === 'user' ? 'user' : 'model'}: ${msg.content}`
        }))
      ]);
      return result.response.text();
    } catch (geminiError) {
      console.error("[GEMINI_FALLBACK_ERROR]:", geminiError.message);
      throw new Error(`AI service unavailable. ${error.message}`);
    }
  }
}



/**
 * Generates a short, descriptive title for a chat session based on the first message.
 * @param {string} firstMessage - The first message of the conversation.
 * @returns {Promise<string>}
 */
export async function generateChatTitle(firstMessage) {
  const prompt = `Generate a very short (2-4 words) title for a conversation that starts with this message: "${firstMessage}". 
  The title should be in the same language as the message (English or Urdu). Respond ONLY with the title.`;

  try {
    const result = await flashModel.generateContent(prompt);
    const title = result.response.text();
    return title.replace(/["']/g, "").trim().substring(0, 50);
  } catch (error) {
    console.error("[TITLE_GENERATION_ERROR]:", error);
    return "New Conversation";
  }
}

/**
 * Analyzes an image (diagram, handwritten note, etc.) and solves the problem.
 * @param {string} base64Image - The image data in base64.
 * @param {string} mimeType - The mime type of the image.
 * @param {string} prompt - The student's question or context.
 * @returns {Promise<string>} - The AI's explanation.
 */
export async function analyzeImageProblem(base64Image, mimeType, prompt = "Analyze this image and solve the problem step-by-step.") {
  const model = flashModel;

  const parts = [
    {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    },
    { text: `You are Imtihan AI Tutor, an expert in Pakistani curriculum (9th-12th Grade). 
    Your task is to analyze the provided image (which could be a diagram, a handwritten question, or a textbook page) and solve the problem.
    
    INSTRUCTIONS:
    1. Identify what the image is (e.g., "This looks like a Physics circuit diagram" or "This is a Biology cell diagram").
    2. Provide a step-by-step explanation of the solution.
    3. If the image is unclear, ask the student to provide a better photo.
    4. If there are multiple problems in the image, solve the most prominent one or provide a general overview.
    5. Always encourage the student to practice similar problems on the Imtihan app.
    
    Student's Message: ${prompt}
    
    SOLVE STEP-BY-STEP:` }
  ];

  try {
    const result = await model.generateContent(parts);
    return result.response.text();
  } catch (error) {
    console.error("[VISUAL_AI_ERROR]:", error);
    throw new Error("Failed to analyze image. Please ensure your API key has multi-modal support.");
  }
}
