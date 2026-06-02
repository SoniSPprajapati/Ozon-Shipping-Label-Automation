import fs from 'fs';

export function extractProductDetails(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const products = {};
  
  let currentShipment = null;
  let currentTitleLines = [];
  
  for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lineForProduct = line;
        
        let shipMatch = line.match(/\b(\d{8,12}\s*-\s*\d{4}\s*-\s*\d{1,3})\b/);
        if (shipMatch) {
            currentShipment = shipMatch[1].replace(/[\s-]/g, '');
            if (!products[currentShipment]) products[currentShipment] = [];
            
            lineForProduct = line.substring(shipMatch.index + shipMatch[0].length).trim();
            lineForProduct = lineForProduct.replace(/^\d+\s*/, '').trim(); 
            
            // Overwrite buffer with this new product title start
            currentTitleLines = lineForProduct ? [lineForProduct] : [];
        } else if (currentShipment) {
            // Ignore page artifacts & headers
            if (/^(?:Date:|Check the list|Warehouse:|Delivery service:|№ Shipment number)/i.test(line)) {
                continue;
            }
            if (/^(?:-- \d+ of \d+ --)$/.test(line)) {
                continue;
            }
            if (/^(?:--|of|из)$/i.test(line)) {
                continue;
            }
            
            currentTitleLines.push(line);
            lineForProduct = line;
        } else {
             continue;
        }
        
        // Exact End-of-line verification: Title + SKU + Qty numbers
        let endMatch = lineForProduct.match(/(?:^|\s)([A-Za-z0-9]+[-.][A-Za-z0-9_\-\.]+|[A-Z0-9_\-\.]{5,}|[A-Za-z0-9]+-[A-Za-z0-9]+)\s+([\d\s]+)$/);
        
        if (endMatch) {
             let sku = endMatch[1];
             if (['quantity', 'label', 'code', 'product'].includes(sku.toLowerCase())) {
                 continue; 
             }
             
             let numSlice = endMatch[2].trim().split(/\s+/);
             let qty = '1';
             
             // Ozon Qty is always the FIRST number following the SKU in this layout
             if (numSlice.length > 0) {
                 let parsedFirst = parseInt(numSlice[0]);
                 if (parsedFirst > 0 && parsedFirst < 10000) {
                     qty = parsedFirst.toString();
                 }
             }
             
             let cleanedLine = lineForProduct.substring(0, endMatch.index).trim();
             
             if (cleanedLine) {
                 currentTitleLines[currentTitleLines.length - 1] = cleanedLine;
             } else {
                 currentTitleLines.pop();
             }
             
             let title = currentTitleLines.join(' ').replace(/\b\d+\s*(?:шт\.?|pcs)\b/gi, '').trim();
             products[currentShipment].push({
                 title: title || 'Unknown Product',
                 sku: sku,
                 qty: qty
             });
             
             // Clear for next potential product inside shipment
             currentTitleLines = [];
        }
  }
  
  return products;
}

const text = fs.readFileSync('dump.txt', 'utf8');
const prods = extractProductDetails(text);

let linesOut = [];
for (let id in prods) {
    if (prods[id].length === 0) {
        linesOut.push(`Shipment: ${id}\nSKU: NO_PRODUCTS`);
    }
    prods[id].forEach(p => {
        linesOut.push(`Shipment: ${id}\nSKU: ${p.sku}\nTitle: ${p.title}\nQty: ${p.qty}\n---`);
    });
}
fs.writeFileSync('dump_out3.txt', linesOut.join('\n'));
