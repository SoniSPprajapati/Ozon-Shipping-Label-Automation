import { readPdf } from './src/pdf/read.js';
import fs from 'fs';

async function run() {
    const text = await readPdf('../dashboard/tmp/products_1780234831826.pdf');
    fs.writeFileSync('pdf_dump.txt', text, 'utf8');
}
run();
