// src/processFile.js
import path from 'path';
import fs from 'fs';
import { extractTrackingIds } from './parser/extractTracking.js';
import { generateBarcode } from './barcode/generateBarcode.js';
import { createWord } from './word/createWord.js';
import { log } from './logger.js'; // we'll create a tiny logger helper

/**
 * Process a single PDF file: extract IDs, generate barcodes, create a Word document.
 * @param {string} pdfPath - absolute path to the PDF file
 */
export async function processFile(pdfPath) {
  // Ensure output folders exist
  const outputDir = path.resolve(__dirname, '..', 'output');
  const barcodeDir = path.join(outputDir, 'barcodes');
  const wordDir = path.join(outputDir, 'word');
  [barcodeDir, wordDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

  log(`Processing file: ${pdfPath}`);
  const ids = await extractTrackingIds(pdfPath);
  if (!ids || ids.length === 0) {
    log('No tracking IDs found', 'WARN');
    return;
  }

  const generated = [];
  for (const id of ids) {
    const outPath = await generateBarcode(id, barcodeDir);
    if (outPath) {
      generated.push({ id, imagePath: outPath });
    } else {
      log(`Failed barcode generation for ID: ${id}`, 'ERROR');
    }
  }
  log(`Generated barcodes: ${generated.length}/${ids.length}`);

  // Create a Word file named after the source PDF (without extension)
  const baseName = path.basename(pdfPath, path.extname(pdfPath));
  const wordPath = path.join(wordDir, `${baseName}.docx`);
  await createWord(generated, wordPath);
  log(`Word file created: ${wordPath}`);
}
