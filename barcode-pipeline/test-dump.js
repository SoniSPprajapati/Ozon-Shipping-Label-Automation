import fs from 'fs';
import { extractProductDetails } from './src/parser/productDetails.js';

const text = fs.readFileSync('dump.txt', 'utf8');
const prods = extractProductDetails(text);

let allValid = true;

for (let id in prods) {
    if (prods[id].length === 0) {
        console.log(`Shipment: ${id}\nSKU: NO_PRODUCTS_EXTRACTED`);
    }
    prods[id].forEach(p => {
        console.log(`Shipment: ${id}\nSKU: ${p.sku}\nTitle: ${p.title}\nQty: ${p.qty}\n---`);
    });
}
