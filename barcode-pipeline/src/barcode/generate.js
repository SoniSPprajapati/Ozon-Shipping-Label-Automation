import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';

export async function generateBarcodes(trackingIds, outputDir) {
  const generatedPaths = [];
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const id of trackingIds) {
    try {
      const pngBuffer = await bwipjs.toBuffer({
        bcid: 'code128',
        text: id,
        scale: 2,           // smaller, more compact width
        height: 12,         // optimal height balance
        includetext: true,
        textxalign: 'center',
      });
      
      const outputPath = path.join(outputDir, `${id}.png`);
      fs.writeFileSync(outputPath, pngBuffer);
      generatedPaths.push(outputPath);
    } catch (err) {
      // Log failure but don't crash, allowing other barcodes to continue
      console.error(`\n❌ Failed to generate barcode for ID ${id}: ${err.message}`);
    }
  }

  return generatedPaths;
}
