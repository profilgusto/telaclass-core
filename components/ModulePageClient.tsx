'use client'

import { Course } from '@/lib/content'
import { CourseSidebar } from '@/components/course-sidebar'
import MdxRenderer from '@/components/presentation/MdxRenderer'
import { useViewMode } from '@/components/presentation/useViewMode'

export function ModulePageClient({
  course,
  slug,
  mod,
  manifestKey,
}: {
  course: Course
  slug: string
  mod: string
  manifestKey: string
}) {
  const mode = useViewMode()
  const showSidebar = mode !== 'apresentacao'

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <aside className="hidden md:block w-60 shrink-0 border-r border-border bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
          <CourseSidebar course={course} slug={slug} />
        </aside>
      )}
      <main className="flex-1 px-[var(--space-lg)] py-[var(--space-md)]">
        <MdxRenderer manifestKey={manifestKey} slug={slug} mod={mod} />
      </main>
    </div>
  )
}
