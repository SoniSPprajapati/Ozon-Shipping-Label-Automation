import { readPdfPages } from './src/pdf/read.js';
import { extractTrackingIds } from './src/parser/extractTracking.js';
import { readPdf } from './src/pdf/read.js';
import { extractProductDetails } from './src/parser/productDetails.js';
import fs from 'fs';
import path from 'path';

// Find latest uploads
const tmpDir = '../dashboard/tmp';
const files = fs.readdirSync(tmpDir);
const shippingFile = files.filter(f => f.startsWith('shipping_')).sort().pop();
const productFile  = files.filter(f => f.startsWith('products_')).sort().pop();

console.log('Shipping:', shippingFile);
console.log('Products:', productFile);

const labelPages  = await readPdfPages(path.join(tmpDir, shippingFile));
const productText = await readPdf(path.join(tmpDir, productFile));
const productMap  = extractProductDetails(productText);

let out = `=== SHIPPING LABEL PAGES (${labelPages.length} total) ===\n`;
for (let i = 0; i < labelPages.length; i++) {
    const ids = extractTrackingIds(labelPages[i]);
    out += `Page ${i + 1}: IDs = [${ids.join(', ')}]\n`;
}

out += `\n=== PRODUCT MAP (${Object.keys(productMap).length} shipments) ===\n`;
for (const [id, prods] of Object.entries(productMap)) {
    out += `ID: ${id}  -> ${prods.length} product(s)\n`;
    prods.forEach((p, idx) => {
        out += `   [${idx+1}] SKU=${p.sku}  Qty=${p.qty}  Title=${p.title.slice(0,80)}\n`;
    });
}

out += '\n=== UNMATCHED (label pages with no product data) ===\n';
for (let i = 0; i < labelPages.length; i++) {
    const ids = extractTrackingIds(labelPages[i]);
    for (const id of ids) {
        if (!productMap[id]) {
            out += `Page ${i+1}: [${id}] NOT in product map\n`;
        }
    }
}

out += '\n=== MULTI-PRODUCT SHIPMENTS ===\n';
for (const [id, prods] of Object.entries(productMap)) {
    if (prods.length > 1) {
        out += `ID: ${id} -> ${prods.length} products\n`;
        prods.forEach((p, idx) => out += `   [${idx+1}] SKU=${p.sku}  Qty=${p.qty}\n`);
    }
}

fs.writeFileSync('debug_out.json', JSON.stringify({ log: out }, null, 2), 'utf8');
console.log('Done.');
