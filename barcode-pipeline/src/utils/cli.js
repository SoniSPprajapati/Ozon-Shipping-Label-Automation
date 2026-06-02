import * as p from '@clack/prompts';
import pc from 'picocolors';

export function intro() {
  p.intro(pc.bgBlue(pc.white(' 🚀 Ozon Barcode Automation Pipeline ')));
}

export function outro(message) {
  p.outro(pc.green(message));
}

export function logSuccess(message) {
  p.log.success(message);
}

export function logError(message) {
  p.log.error(message);
}

export function logInfo(message) {
  p.log.info(message);
}

export function spinner() {
  return p.spinner();
}

export async function askPdfPath() {
  const result = await p.text({
    message: 'Enter shipping-label PDF path:',
    placeholder: 'C:\\labels\\ozon-labels.pdf',
    validate: (value) => {
      if (!value) return 'Please enter a path';
    }
  });

  if (p.isCancel(result)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  return result;
}

export async function askProductListPath() {
  const result = await p.text({
    message: 'Enter product-list PDF path (optional but recommended):',
    placeholder: 'C:\\labels\\product-list.pdf'
  });

  if (p.isCancel(result)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  return result;
}
