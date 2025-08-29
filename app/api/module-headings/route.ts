import { NextRequest, NextResponse } from 'next/server'
import { getModuleHeadings } from '@/lib/content'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const mod = searchParams.get('mod')
  if (!slug || !mod) {
    return NextResponse.json({ error: 'Missing slug or mod' }, { status: 400 })
  }
  try {
    const headings = await getModuleHeadings(slug, mod)
    return NextResponse.json({ headings }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
