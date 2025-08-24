import { NextRequest, NextResponse } from 'next/server';
import { getCourse } from '@/lib/content';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  try {
    const course = await getCourse(slug);
    return NextResponse.json(course, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
}
