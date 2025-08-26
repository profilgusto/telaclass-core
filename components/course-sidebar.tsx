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

    return (
        <nav className="p-[var(--space-md)] space-y-[var(--space-xs)] text-sm overflow-y-auto overscroll-contain h-full">
            {course.entries
                .filter((e) => e.visible !== false)
                .map((e: CourseEntry) => {
                    const slugPath = normalize(e.path as string);
                    const href = `/disciplinas/${slug}/${slugPath}`;
                    const active = normalize(pathname) === normalize(href);
                    const isCurrentModule = currentModulePath && normalize(currentModulePath) === slugPath && e.type === 'module';
                    return (
                        <div key={e.id}>
                            <Link 
                                href={href}
                                className={clsx(
                                    'block hover:underline',
                                    active && 'font-medium'
                                )}
                            >
                                {e.type === 'module' && e.number ? `${e.number}. ` : ''}
                                {e.title}
                            </Link>
                                                        {isCurrentModule && headings.length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3 text-xs">
                                    {headings.map(h => (
                                        <li key={h.id}>
                                            <a
                                                                                            href={`${href}#${h.id}`}
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
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
        </nav>
    );
};