import type { ReactNode } from 'react';
import { getCourse } from '@/lib/content';
import { CourseSidebar } from '@/components/course-sidebar';

export default async function DisciplinaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const course = await getCourse(params.slug);
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (66 % largura no mobile ocultaremos via Drawer) */}
      <aside
        className="hidden md:block w-60 shrink-0 border-r
                        border-border bg-[var(--sidebar)]
                        text-[var(--sidebar-foreground)]"
      >
        <CourseSidebar course={course} />
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 px-[var(--space-lg)] py-[var(--space-md)]">
        {children}
      </main>
    </div>
  );
}