// src/createSamplePdf.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createSample() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const text = `Sample Ozon Shipping Labels\n\nTracking IDs:\n79369156-0060-1\n43780501-0529-1`;
  page.drawText(text, {
    x: 50,
    y: 750,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  const pdfBytes = await pdfDoc.save();
  const inputDir = path.resolve(__dirname, '..', 'input');
  fs.mkdirSync(inputDir, { recursive: true });
  const outPath = path.join(inputDir, 'sample.pdf');
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`[INFO] Sample PDF created at ${outPath}`);
}

createSample();
