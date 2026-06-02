// src/barcode/generateBarcode.js
import bwipjs from 'bwip-js';
import fs from 'fs';
import path from 'path';

/**
 * Generate a Code128 barcode PNG for a cleaned ID.
 * @param {string} cleanId - cleaned numeric barcode string
 * @param {string} outputDir - absolute path to output directory (e.g., ".../output/barcodes")
 * @returns {Promise<string|null>} - full path to generated PNG or null on failure
 */
export async function generateBarcode(cleanId, outputDir) {
  try {
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });
    const outPath = path.join(outputDir, `${cleanId}.png`);

    // bwip-js options for high‑DPI, printer‑friendly barcode
    const png = await bwipjs.toBuffer({
      bcid:        'code128',      // Barcode type
      text:        cleanId,        // Text to encode
      scale:       4,              // 4x scaling (increase DPI)
      height:      30,             // Bar height, mm‑like units
      includetext: true,           // Show human‑readable text
      textxalign:  'center',
      textsize:    13,
      backgroundcolor: 'FFFFFF',
      paddingwidth: 10,
      paddingheight: 10,
    });

    // Write PNG file
    fs.writeFileSync(outPath, png);
    console.log(`[INFO] Barcode generated: ${outPath}`);
    return outPath;
  } catch (err) {
    console.error(`[ERROR] Failed barcode: ${cleanId}`, err);
    // Continue processing – return null to signal failure
    return null;
  }
}
