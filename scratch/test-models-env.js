const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function main() {
  try {
    console.log("Listing models for key:", process.env.GOOGLE_AI_API_KEY.substring(0, 10) + "...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ Model ${m} is AVAILABLE`);
      } catch (e) {
        console.log(`❌ Model ${m} is NOT available: ${e.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
