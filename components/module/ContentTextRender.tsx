"use client"
import { Course } from '@/lib/content'
import { CourseSidebar } from '@/components/course-sidebar'
import { ModuleContentCore } from './ModuleContentCore'

interface Props {
  course: Course
  slug: string
  mod: string
  manifestKey: string
  headings: Array<{ id: string; text: string }>
  active: boolean
}

export function ContentTextRender({ course, slug, mod, manifestKey, headings, active }: Props) {
  return (
    <div className={['flex min-h-screen', active ? '' : 'hidden'].join(' ')}>
      <aside className="hidden md:block w-60 shrink-0 border-r border-border bg-[var(--sidebar)] text-[var(--sidebar-foreground)] sticky top-14 h-[calc(100vh-56px)]">
        <CourseSidebar course={course} slug={slug} currentModulePath={mod} headings={headings} />
      </aside>
      <main className="flex-1 px-[var(--space-lg)] py-[var(--space-md)]">
        <ModuleContentCore manifestKey={manifestKey} slug={slug} mod={mod} mode="texto" />
      </main>
    </div>
  )
}
