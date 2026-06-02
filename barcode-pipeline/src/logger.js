// src/logger.js
/**
 * Simple logger that prints to console and appends to a log file.
 * Used by the TUI CLI and the reusable processFile function.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, '..', 'output', 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, 'pipeline.log');

export function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const line = `[${level}] ${timestamp} ${message}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) {
    // ignore logging errors
  }
}
