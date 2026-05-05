const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

// Custom fetch to bypass the 3 minute timeout
const customFetch = (url, init) => {
  return fetch(url, { ...init, signal: AbortSignal.timeout(600000) }); // 10 minutes
};

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey, { fetch: customFetch });
const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function testTimeoutFix() {
  const filePath = path.join(__dirname, '../assets/Computer-9 (BWP-24).pdf');
  const fileBuffer = fs.readFileSync(filePath);
  
  try {
    console.log("Uploading with extended timeout (10 mins)... Please wait.");
    const result = await flashModel.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      },
      { text: "Extract exactly 1 multiple choice question from this PDF. Output strictly as a JSON array of 1 object." }
    ]);
    
    console.log("Success! Extracted:");
    console.log(result.response.text());
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testTimeoutFix();
