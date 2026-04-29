
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');


/**
 * Extracts text from a PDF buffer.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} - The extracted text content.
 */
export async function extractTextFromPDF(buffer) {
  try {
    const parser = new pdf.PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();
    return text;
  } catch (error) {
    console.error("[PDF_EXTRACTION_ERROR]:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Cleans extracted text for AI processing.
 * @param {string} text - The raw extracted text.
 * @returns {string} - The cleaned text.
 */
export function cleanExtractedText(text) {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespaces with single space
    .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
    .trim();
}
