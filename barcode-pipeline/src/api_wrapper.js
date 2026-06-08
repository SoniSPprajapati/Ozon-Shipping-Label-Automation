import path from 'path';
import fs from 'fs';
import { readPdf, readPdfPages } from './pdf/read.js';
import { extractTrackingIds } from './parser/extractTracking.js';
import { extractProductDetails } from './parser/productDetails.js';
import { translateBulk } from './utils/translate.js';
import { createThermalPDFWithDetails } from './pdf/generate.js';

async function processPipeline(labelPdfPath, productPdfPath, outputPdfPath) {
  try {
    let productMap = {};

    // Parse Product List (if provided)
    if (productPdfPath && fs.existsSync(productPdfPath)) {
      const productRawText = await readPdf(productPdfPath);
      productMap = extractProductDetails(productRawText);

      // Bulk translate titles
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
    }

    // Process Shipping Labels Page by Page
    const labelPagesText = await readPdfPages(labelPdfPath);
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
                // Fallback if not physically found
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

    // Generate the Thermal Layout
    const originalLabelBytes = fs.readFileSync(labelPdfPath);
    await createThermalPDFWithDetails(originalLabelBytes, pagesData, outputPdfPath);
    
    console.log(JSON.stringify({ 
      success: true, 
      labelCount: pagesData.length,
      thermalPdfPath: outputPdfPath
    }));

  } catch (error) {
    console.error("Pipeline Error:", error);
    console.log(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }));
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(JSON.stringify({ success: false, error: "Missing arguments: <labelPdf> <productPdf> [outputPdf]" }));
  process.exit(1);
}

const labelPdfPath = args[0];
const productPdfPath = args[1] === 'null' ? null : args[1];
const outputPdfPath = args[2] || path.join(process.cwd(), 'output', `thermal_labels_${Date.now()}.pdf`);

processPipeline(labelPdfPath, productPdfPath, outputPdfPath);
