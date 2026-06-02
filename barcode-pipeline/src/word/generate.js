import { Document, Packer, Paragraph, ImageRun } from 'docx';
import fs from 'fs';
import path from 'path';

export async function createWordDocument(imagePaths, outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const children = [];

  for (const imagePath of imagePaths) {
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: 220,   // More compact width
                height: 70,   // Proportionally compact height
              },
            }),
          ],
          spacing: {
            before: 300,      // Small gap to help with cutting
            after: 300,
          }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 700,    // Narrower margins for more printable area
              right: 700,
              bottom: 700,
              left: 700,
            },
          },
        },
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  
  return outputPath;
}
