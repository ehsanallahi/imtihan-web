const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

function createPayload() {
  const filePath = path.join(__dirname, '../assets/Computer-9 (BWP-24).pdf');
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  const payload = {
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data
          }
        },
        { text: "Extract exactly 1 multiple choice question from this PDF. Output strictly as a JSON array of 1 object." }
      ]
    }]
  };

  fs.writeFileSync(path.join(__dirname, 'payload.json'), JSON.stringify(payload));
  console.log("payload.json created");
}

createPayload();
