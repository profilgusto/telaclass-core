'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import type { Course } from '@/lib/content';
import type { CourseEntry } from '@/lib/content';

export function CourseSidebar({ 
    course, 
    slug, 
    currentModulePath,
    headings = [],
    currentHeadingId,
}: { 
    course: Course; 
    slug: string; 
    currentModulePath?: string;
    headings?: Array<{ id: string; text: string }>;
    currentHeadingId?: string | null;
}) {
    const pathname = usePathname();
    const normalize = (s: string) => s.replace(/^\/+|\/+$/g, '');

        const visible = course.entries.filter(e => e.visible !== false)
        const modules = visible.filter(e => e.type === 'module')
        const activities = visible.filter(e => e.type === 'activity')
        return (
                <nav className="p-[var(--space-md)] space-y-[var(--space-lg)] text-sm overflow-y-auto overscroll-contain h-full" aria-label={`Navegação da disciplina ${course.title}`}>
                                    <div className="mb-4">
                                            <Link
                                                href={`/disciplinas/${slug}`}
                                                className="text-base font-semibold leading-snug tracking-tight hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                                                aria-label={`Ir para a página da disciplina ${course.title}`}
                                            >
                                                {course.title}
                                            </Link>
                                    </div>
                        {modules.length > 0 && (
                            <div className="space-y-1" aria-label="Módulos">
                                <div className="text-[10px] uppercase tracking-wide font-semibold opacity-60 mb-1">Módulos</div>
                                {modules.map((e: CourseEntry) => {
                                    const slugPath = normalize(e.path as string)
                                    const href = `/disciplinas/${slug}/${slugPath}`
                                    const active = normalize(pathname) === normalize(href)
                                    const isCurrentModule = currentModulePath && normalize(currentModulePath) === slugPath && e.type === 'module'
                                    return (
                                        <div key={e.id}>
                                            <Link
                                                href={href}
                                                className={clsx('block hover:underline', active && 'font-medium')}
                                            >
                                                {e.type === 'module' && e.number ? `${e.number}. ` : ''}{e.title}
                                            </Link>
                                            {isCurrentModule && headings.length > 0 && (
                                                <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3 text-xs">
                                                    {headings.map(h => {
                                                        const headingHref = `${href}#${h.id}`
                                                        return (
                                                            <li key={h.id}>
                                                                <a
                                                                    href={headingHref}
                                                                    className={clsx(
                                                                        'block hover:underline transition-colors',
                                                                        currentHeadingId === h.id
                                                                            ? 'opacity-100 font-medium text-primary'
                                                                            : 'opacity-70 hover:opacity-100'
                                                                    )}
                                                                    aria-current={currentHeadingId === h.id ? 'true' : undefined}
                                                                >
                                                                    {h.text}
                                                                </a>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {activities.length > 0 && (
                            <div className="space-y-1" aria-label="Atividades">
                                <div className="text-[10px] uppercase tracking-wide font-semibold opacity-60 mb-1">Atividades</div>
                                {activities.map(a => {
                                    const slugPath = normalize(a.path as string)
                                    const href = `/disciplinas/${slug}/${slugPath}`
                                    const active = normalize(pathname) === normalize(href)
                                    return (
                                        <div key={a.id}>
                                            <Link
                                                href={href}
                                                className={clsx('block hover:underline', active && 'font-medium')}
                                            >
                                                {a.title}
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                </nav>
        );
};