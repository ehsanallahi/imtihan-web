const fs = require('fs');
const path = require('path');
const { GoogleAIFileManager } = require("@google/generative-ai/server");
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_AI_API_KEY;
const fileManager = new GoogleAIFileManager(apiKey);

async function testSmallFile() {
  const filePath = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(filePath, "This is a tiny file to test the upload connection.");
  
  try {
    console.log("Uploading tiny file to Google AI...");
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "text/plain",
      displayName: "Dummy-Test",
    });
    
    console.log(`Success! Uploaded as: ${uploadResponse.file.uri}`);
    await fileManager.deleteFile(uploadResponse.file.name);
    console.log("Cleanup complete.");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    fs.unlinkSync(filePath);
  }
}

testSmallFile();
