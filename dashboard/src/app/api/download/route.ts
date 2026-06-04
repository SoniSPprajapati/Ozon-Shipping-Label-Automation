import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('f');

  if (!file) {
    return NextResponse.json({ error: 'File parameter is missing' }, { status: 400 });
  }

  // Prevent directory traversal
  const safeFile = path.basename(file);
  const filePath = path.join(process.cwd(), 'public', 'outputs', safeFile);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeFile}"`,
    },
  });
}
