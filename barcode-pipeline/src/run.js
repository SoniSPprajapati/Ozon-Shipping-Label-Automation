// src/run.js
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { processFile } from './processFile.js';
import { log } from './logger.js';

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    const inputPath = await ask('Enter PDF file path: ');
    if (!inputPath) {
      log('No path provided – exiting', 'WARN');
      return;
    }
    const absolutePath = path.isAbsolute(inputPath)
      ? inputPath
      : path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(absolutePath) || path.extname(absolutePath).toLowerCase() !== '.pdf') {
      log(`Invalid PDF path: ${absolutePath}`, 'ERROR');
      return;
    }
    await processFile(absolutePath);
    log('Processing completed successfully');
  } catch (err) {
    log(`Unexpected error: ${err.message}`, 'ERROR');
  }
}

// Execute when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
