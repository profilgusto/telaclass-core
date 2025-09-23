// app/disciplinas/[slug]/[mod]/[...asset]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import path from 'node:path';

function baseDir() {
  return path.join(process.cwd(), 'content', 'disciplinas');
}

function mimeOf(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.avif': return 'image/avif';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.ogg': return 'video/ogg';
    case '.mp3': return 'audio/mpeg';
    case '.wav': return 'audio/wav';
    case '.json': return 'application/json';
    case '.txt': return 'text/plain; charset=utf-8';
    case '.md':
    case '.mdx': return 'text/markdown; charset=utf-8';
    default: return 'application/octet-stream';
  }
}

const isImage = (m: string) => m.startsWith('image/');
const etag = (st: { size: number; mtimeMs: number }) =>
  `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
const cacheFor = (m: string, prod: boolean) =>
  isImage(m)
    ? (prod ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate')
    : (prod ? 'public, max-age=3600' : 'public, max-age=0, must-revalidate');

async function resolveSafe(slug: string, mod: string, parts: string[]) {
  const root = baseDir();
  const target = path.join(root, slug, mod, ...parts);
  const resolved = path.resolve(target);
  const allowed = path.resolve(path.join(root, slug, mod));
  return resolved.startsWith(allowed) ? resolved : null;
}

function toWebStream(nodeStream: fs.ReadStream) {
  return new ReadableStream({
    start(c) {
      nodeStream.on('data', (chunk) => c.enqueue(chunk));
      nodeStream.on('end', () => c.close());
      nodeStream.on('error', (e) => c.error(e));
    },
    cancel() { nodeStream.destroy(); }
  });
}

export async function HEAD(
  _req: Request,
  ctx: { params: Promise<{ slug: string; mod: string; asset: string[] }> }
) {
  const { slug, mod, asset } = await ctx.params;
  const filePath = await resolveSafe(slug, mod, asset);
  if (!filePath) return new NextResponse('Forbidden', { status: 403 });
  try {
    const st = await fsp.stat(filePath);
    const m = mimeOf(filePath);
    const h = new Headers({
      'Content-Type': m,
      'Content-Length': String(st.size),
      'ETag': etag(st),
      'Last-Modified': new Date(st.mtimeMs).toUTCString(),
      'Cache-Control': cacheFor(m, process.env.NODE_ENV === 'production'),
      'Accept-Ranges': 'bytes',
    });
    return new NextResponse(null, { status: 200, headers: h });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string; mod: string; asset: string[] }> }
) {
  const { slug, mod, asset } = await ctx.params;
  const filePath = await resolveSafe(slug, mod, asset);
  if (!filePath) return new NextResponse('Forbidden', { status: 403 });

  try {
    const st = await fsp.stat(filePath);
    const m = mimeOf(filePath);
    const tag = etag(st);
    const lastMod = new Date(st.mtimeMs).toUTCString();
    const prod = process.env.NODE_ENV === 'production';

    // Range (vídeo/áudio/pdf) — must take precedence over 304 checks
    // Some browsers send conditional headers along with Range; returning 304 here breaks playback.
    const range = req.headers.get('range');
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : st.size - 1;
        if (start <= end && start >= 0 && end < st.size) {
          const stream = fs.createReadStream(filePath, { start, end });
          const h = new Headers({
            'Content-Type': m,
            'Content-Length': String(end - start + 1),
            'Content-Range': `bytes ${start}-${end}/${st.size}`,
            'Accept-Ranges': 'bytes',
            'ETag': tag,
            'Last-Modified': lastMod,
            'Cache-Control': cacheFor(m, prod),
          });
          return new NextResponse(toWebStream(stream), { status: 206, headers: h });
        }
      }
      const h = new Headers({ 'Content-Range': `bytes */${st.size}` });
      return new NextResponse('Range Not Satisfiable', { status: 416, headers: h });
    }

    // 304 for non-range requests
    const inm = req.headers.get('if-none-match');
    const ims = req.headers.get('if-modified-since');
    if ((inm && inm === tag) || (ims && new Date(ims) >= new Date(lastMod))) {
      const h = new Headers({
        'ETag': tag,
        'Last-Modified': lastMod,
        'Cache-Control': cacheFor(m, prod),
      });
      return new NextResponse(null, { status: 304, headers: h });
    }

    // Conteúdo completo
    if (st.size < 5 * 1024 * 1024) {
      const buf = await fsp.readFile(filePath);
      const h = new Headers({
        'Content-Type': m,
        'Content-Length': String(st.size),
        'ETag': tag,
        'Last-Modified': lastMod,
        'Cache-Control': cacheFor(m, prod),
        'Accept-Ranges': 'bytes',
      });
      // Buffer -> Uint8Array to satisfy BodyInit typing in Next.js (TS) during build
      return new NextResponse(new Uint8Array(buf), { status: 200, headers: h });
    } else {
  const stream = fs.createReadStream(filePath);
      const h = new Headers({
        'Content-Type': m,
        'Content-Length': String(st.size),
        'ETag': tag,
        'Last-Modified': lastMod,
        'Cache-Control': cacheFor(m, prod),
        'Accept-Ranges': 'bytes',
      });
      return new NextResponse(toWebStream(stream), { status: 200, headers: h });
    }
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}