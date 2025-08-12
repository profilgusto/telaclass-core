// app/disciplinas/[slug]/[mod]/file/[...asset]/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function contentBase() {
  return path.join(process.cwd(), 'content', 'disciplinas');
}

function guessContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; mod: string; asset: string[] }> }
) {
  const { slug, mod, asset } = await params;

  const base = contentBase();
  const target = path.join(base, slug, mod, ...asset); // ex: .../sistemas-supervisorios/teste/img/logo.png

  // proteção contra path traversal
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(path.join(base, slug, mod)))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const data = await fs.readFile(resolved);
    const headers = new Headers({
      'Content-Type': guessContentType(resolved),
      // cache leve em dev; em prod você pode aumentar
      'Cache-Control': 'public, max-age=0, must-revalidate',
    });
    return new NextResponse(data, { headers });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}