'use client'

import { Course } from '@/lib/content'
import { CourseSidebar } from '@/components/course-sidebar'
import { useViewMode } from '@/components/presentation/useViewMode'
import { ContentTextRender } from '@/components/module/ContentTextRender'
import { ContentSlideRender } from '@/components/module/ContentSlideRender'

export function ModulePageClient({
  course,
  slug,
  mod,
  manifestKey,
  headings = [],
}: {
  course: Course
  slug: string
  mod: string
  manifestKey: string
  headings?: Array<{ id: string; text: string }>
}) {
  const mode = useViewMode()
  // Keep both mounted so switching mode does not re-fetch or lose state.
  return (
    <>
      <ContentTextRender
        course={course}
        slug={slug}
        mod={mod}
        manifestKey={manifestKey}
        headings={headings}
        active={mode === 'texto'}
      />
      <ContentSlideRender
        manifestKey={manifestKey}
        slug={slug}
        mod={mod}
        active={mode === 'apresentacao'}
      />
    </>
  )
}
