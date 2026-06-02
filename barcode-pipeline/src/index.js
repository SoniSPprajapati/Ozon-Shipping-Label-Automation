import path from 'path';
import fs from 'fs';
import { intro, outro, logSuccess, logError, spinner, askPdfPath, askProductListPath } from './utils/cli.js';
import { readPdf, readPdfPages } from './pdf/read.js';
import { extractTrackingIds } from './parser/extractTracking.js';
import { extractProductDetails } from './parser/productDetails.js';
import { translateBulk } from './utils/translate.js';
import { createThermalPDFWithDetails } from './pdf/generate.js';

async function main() {
  intro();

  // 1. Inputs
  let pdfPath = await askPdfPath();
  while (true) {
    pdfPath = pdfPath.replace(/^['"]|['"]$/g, '');
    const ext = path.extname(pdfPath).toLowerCase();
    if (ext !== '.pdf') {
       logError('The provided shipping-label file is not a PDF.');
       pdfPath = await askPdfPath();
       continue;
    }
    break;
  }

  let productPdfPath = await askProductListPath();
  while (productPdfPath) {
    productPdfPath = productPdfPath.replace(/^['"]|['"]$/g, '');
    const ext = path.extname(productPdfPath).toLowerCase();
    if (ext !== '.pdf') {
       logError('The provided product-list file is not a PDF. (Press enter to skip)');
       productPdfPath = await askProductListPath();
       continue;
    }
    break;
  }

  const s = spinner();

  try {
    let productMap = {};

    // 2. Parse Product List (if provided)
    if (productPdfPath && fs.existsSync(productPdfPath)) {
      s.start('Parsing Product List PDF...');
      const productRawText = await readPdf(productPdfPath);
      productMap = extractProductDetails(productRawText);

      // Translate Titles
      s.message('Translating product titles to English...');
      let allTitles = [];
      let mappings = [];
      
      for (const id in productMap) {
         for (const prod of productMap[id]) {
            allTitles.push(prod.title);
            mappings.push(prod);
         }
      }
      
      const translatedTitles = await translateBulk(allTitles);
      for (let i = 0; i < translatedTitles.length; i++) {
          mappings[i].title = translatedTitles[i];
      }
      s.stop(`✅ Extracted & translated ${Object.keys(productMap).length} product entries`);
    }

    // 3. Process Shipping Labels Page by Page
    s.start('Reading Shipping Label pages...');
    const labelPagesText = await readPdfPages(pdfPath);
    
    s.message('Matching shipments to labels...');
    const pagesData = [];
    let lastShipmentId = null;
    
    for (let i = 0; i < labelPagesText.length; i++) {
        const text = labelPagesText[i];
        const ids = extractTrackingIds(text);
        
        let shipmentId = null;
        if (ids.length > 0) {
            shipmentId = ids[0];
        } else if (lastShipmentId) {
            shipmentId = lastShipmentId;
        }
        
        if (shipmentId) {
            lastShipmentId = shipmentId;
            if (productMap[shipmentId] && Array.isArray(productMap[shipmentId])) {
                pagesData.push({
                   pageIndex: i,
                   shipmentId: shipmentId,
                   products: productMap[shipmentId]
                });
            } else {
                // Fallback if not physically found in product list, but ID was found
                pagesData.push({
                   pageIndex: i,
                   shipmentId: shipmentId,
                   products: [{
                       title: 'Unknown Title',
                       sku: 'N/A',
                       qty: '1'
                   }]
                });
            }
        }
    }
    s.stop(`✅ Matched ${pagesData.length} labels with details`);

    // 4. Generate the Thermal Layout
    s.start('Creating 4x6 Thermal PDF...');
    const originalLabelBytes = fs.readFileSync(pdfPath);
    const thermalPdfPath = path.join(process.cwd(), 'output', 'thermal_labels.pdf');
    
    await createThermalPDFWithDetails(originalLabelBytes, pagesData, thermalPdfPath);
    s.stop(`✅ thermal_labels.pdf created successfully`);

    // 5. Success summary
    console.log('\n📂 Outputs:');
    console.log(`* ${path.join('output', 'thermal_labels.pdf')}`);
    
    outro('Pipeline completed successfully! Please print on 4x6 thermal paper.');
  } catch (error) {
    s.stop('Error occurred');
    logError(error.message);
    process.exit(1);
  }
}

main();
