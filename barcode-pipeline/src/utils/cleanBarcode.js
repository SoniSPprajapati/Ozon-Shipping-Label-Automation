// src/utils/cleanBarcode.js
/**
 * Clean a raw tracking/barcode ID.
 * - removes spaces, hyphens, invisible Unicode characters
 * - trims whitespace
 * - keeps only digits (Code128 can encode digits and letters, but Ozon IDs are numeric)
 * @param {string} rawId
 * @returns {string|null} cleaned ID or null if invalid
 */
export function cleanBarcode(rawId) {
  if (typeof rawId !== 'string') return null;
  // Remove spaces, hyphens, and any Unicode control/format characters
  const cleaned = rawId
    .replace(/[\s\-]/g, '') // spaces and hyphens
    .replace(/[\p{C}]/gu, '') // invisible/control chars
    .trim();
  // Keep only digits (you can extend to alphanumerics if needed)
  const onlyDigits = cleaned.replace(/[^0-9]/g, '');
  if (onlyDigits.length === 0) return null;
  return onlyDigits;
}

/**
 * Simple validation – non‑empty and all digits.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidBarcode(id) {
  return typeof id === 'string' && /^[0-9]+$/.test(id);
}

/**
 * Helper to deduplicate cleaned IDs within a single run.
 * @param {string[]} ids
 * @returns {string[]} unique IDs preserving order
 */
export function dedupeIds(ids) {
  const seen = new Set();
  return ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
