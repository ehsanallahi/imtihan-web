const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testFileApi() {
  const filePath = path.join(__dirname, '../assets/Computer-9 (BWP-24).pdf');
  
  try {
    console.log("1. Uploading file to Google AI...");
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: "Computer-9-Test",
    });
    
    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

    console.log("2. Generating content...");
    const result = await flashModel.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
        }
      },
      { text: "Extract 2 multiple choice questions from this PDF. Output strictly as JSON array of objects with keys: question, optionA, optionB, optionC, optionD, correctAnswer, explanation." }
    ]);
    
    console.log("3. Result:");
    console.log(result.response.text());

    console.log("4. Cleaning up file from Google AI...");
    await fileManager.deleteFile(uploadResponse.file.name);
    console.log("Cleanup complete.");
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testFileApi();
