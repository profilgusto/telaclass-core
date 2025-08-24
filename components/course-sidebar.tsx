'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import type { Course } from '@/lib/content';
import type { CourseEntry } from '@/lib/content';

export function CourseSidebar({ 
    course, 
    slug, 
}: { 
    course: Course; 
    slug: string; 
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

                    return (
                        <Link 
                            key={e.id}
                            href={href}
                            className={clsx(
                                'block hover:underline',
                                active && 'font-medium'
                            )}
                        >
                            {e.type === 'module' && e.number ? `${e.number}. ` : ''}
                            {e.title}
                        </Link>
                    );
                })}
        </nav>
    );
};