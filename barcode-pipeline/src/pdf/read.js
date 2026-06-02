import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export async function readPdf(filePath) {
  let parser;
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }
    const dataBuffer = fs.readFileSync(filePath);
    parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    return data.text;
  } catch (error) {
    throw new Error(`Failed to read PDF: ${error.message}`);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

export async function readPdfPages(filePath) {
  let parser;
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }
    const dataBuffer = fs.readFileSync(filePath);
    parser = new PDFParse({ data: dataBuffer });
    
    // We need to know the number of pages first
    const info = await parser.getInfo();
    const totalPages = info.total;
    
    const pagesText = [];
    for (let i = 1; i <= totalPages; i++) {
        // partial takes 1-indexed pages
        const data = await parser.getText({ partial: [i] });
        pagesText.push(data.text);
    }
    return pagesText;
  } catch (error) {
    throw new Error(`Failed to read PDF text by page: ${error.message}`);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
