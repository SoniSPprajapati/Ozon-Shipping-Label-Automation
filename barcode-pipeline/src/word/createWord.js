// src/word/createWord.js
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx';
import fs from 'fs';
import path from 'path';

/**
 * Create a printable Word file containing barcode images and their text.
 * @param {{id:string, imagePath:string}[]} labels - array of label data
 * @param {string} outputPath - absolute path for the .docx file
 */
export async function createWord(labels, outputPath) {
  const children = [];
  for (const {id, imagePath} of labels) {
    const imgData = fs.readFileSync(imagePath);
    const imgPara = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: imgData,
          transformation: {width: 300, height: 150}, // adjust as needed
        }),
      ],
    });
    const txtPara = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {after: 200},
      children: [new TextRun({text: id, font: 'Arial', size: 24})],
    });
    children.push(imgPara, txtPara);
  }
  const doc = new Document({sections: [{children}]});
  const buffer = await Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(outputPath), {recursive:true});
  fs.writeFileSync(outputPath, buffer);
  console.log(`[INFO] Word file created: ${outputPath}`);
  return outputPath;
}
