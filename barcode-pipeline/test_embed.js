import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function test() {
  const destPdf = await PDFDocument.create();
  
  // Make dummy PDF
  const dummySrc = await PDFDocument.create();
  const page1 = dummySrc.addPage([500, 500]);
  page1.drawText("Hello World!", { x: 50, y: 50 });
  const srcBytes = await dummySrc.save();

  // Load pages to embed
  const srcPdfDoc = await PDFDocument.load(srcBytes);
  const embeddedPages = await destPdf.embedPdf(srcBytes);
  
  const page = destPdf.addPage([288, 432]); // 4x6 inches
  page.drawPage(embeddedPages[0], {
    x: 0,
    y: 100,
    width: 288,
    height: 288
  });
  
  console.log("Success embedding!");
}

test().catch(console.error);
