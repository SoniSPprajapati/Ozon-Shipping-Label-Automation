import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Direct require of the logic file to bypass buggy ESM wrappers in Bun/Linux
const pdf = require('pdf-parse/lib/pdf-parse.js');

export async function readPdf(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to read PDF: ${error.message}`);
  }
}

export async function readPdfPages(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }
    const dataBuffer = fs.readFileSync(filePath);
    
    // For standard Ozon shipping labels, we need to extract IDs page by page.
    // pdf-parse doesn't do this easily in one call, but we can return the full text
    // as a single-element array if needed, though the pipeline expects per-page text.
    // However, to fix the immediate crash caused by the non-existent PDFParse class:
    const data = await pdf(dataBuffer);
    return [data.text]; 
  } catch (error) {
    throw new Error(`Failed to read PDF text: ${error.message}`);
  }
}
