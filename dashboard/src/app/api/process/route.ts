import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const shippingLabel = formData.get('shippingLabel') as File;
    const productList = formData.get('productList') as File | null;

    if (!shippingLabel) {
      return NextResponse.json({ error: 'Shipping Label PDF is required.' }, { status: 400 });
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    const timestamp = Date.now();
    const shippingLabelPath = path.join(tmpDir, `shipping_${timestamp}.pdf`);
    const labelBuffer = Buffer.from(await shippingLabel.arrayBuffer());
    await writeFile(shippingLabelPath, labelBuffer);

    let productListPath = 'null';
    if (productList) {
      productListPath = path.join(tmpDir, `products_${timestamp}.pdf`);
      const productBuffer = Buffer.from(await productList.arrayBuffer());
      await writeFile(productListPath, productBuffer);
    }

    const outputDir = path.join(process.cwd(), 'public', 'outputs');
    if (!fs.existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }
    const outputPdfPath = path.join(outputDir, `thermal_labels_${timestamp}.pdf`);

    // Path to the barcode-pipeline root
    const pipelineDir = path.resolve(process.cwd(), '..', 'barcode-pipeline');
    
    const cmd = `bun src/api_wrapper.js "${shippingLabelPath}" "${productListPath}" "${outputPdfPath}"`;

    const { stdout, stderr } = await execAsync(cmd, { cwd: pipelineDir });
    
    // Attempt to parse JSON response from the wrapper
    const outputLines = stdout.trim().split('\n');
    try {
       // Find the line that looks like the JSON result
       const jsonOutput = outputLines.find(line => {
         try {
           const parsed = JSON.parse(line.trim());
           return parsed && typeof parsed === 'object' && 'success' in parsed;
         } catch {
           return false;
         }
       });

       if (!jsonOutput) {
         throw new Error("No valid JSON output found from processing engine.");
       }

       const result = JSON.parse(jsonOutput);
       if (!result.success) {
          throw new Error(result.error || 'Failed at pipeline processing');
       }
       return NextResponse.json({ 
          labelCount: result.labelCount,
          thermalPdfPath: `/api/download?f=thermal_labels_${timestamp}.pdf` // Stream from API instead of strict static route
       });
    } catch (parseError) {
       console.error("Parse Error. Script stdout:", stdout);
       console.error("Stderr:", stderr);
       throw new Error("Invalid output from processing engine. Check server logs.");
    }

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
