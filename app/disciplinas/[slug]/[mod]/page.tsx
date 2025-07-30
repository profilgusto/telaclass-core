import { getCourse, getModule } from '@/lib/content';
import type { CourseEntry } from '@/lib/content';
import { notFound } from 'next/navigation';

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; mod: string }>;
  searchParams?: Record<string, string | string[]>;
}) {
    void searchParams; // keep unused var from lint warning
    const { slug, mod } = await params;
    const course = await getCourse(slug);
    const entry = course.entries.find((e) => e.path === mod);

    if (!entry || entry.visible === false) notFound();

    const content = await getModule(slug, entry.path);

    return(
        <>
            { content.texto && (
                <article 
                    className="prose dark:prose-invert"
                    dangerouslySetInnerHTML={{__html: content.texto }}
                />
            )}

            { content.slides && (
                <section className="mt-[var(--space-lg)]">
                    {/* Placeholder - O Slidesrenderer será criado depois */}
                    <div dangerouslySetInnerHTML={{ __html: content.slides }} />
                </section>
            )}
        </>
    );
}

export async function generateStaticParams() {
    const fs = await import('fs/promises');
    const path = await import ('path');
    const base = path.join(process.cwd(), 'content/disciplinas');

    const dirEntries = await fs.readdir(base, { withFileTypes: true });
    const disciplinas = dirEntries
        .filter(
            (d) =>
                d.isDirectory() &&              // keep only directories
                !d.name.startsWith('.') &&      // ignore .DS_Store, .gitkeep, etc.
                !d.name.startsWith('__')        // ignore __MACOSX or backup dirs
        )
        .map((d) => d.name);

    const params: { slug: string; mod: string }[] = [];

    for (const slug of disciplinas) {
        const jsonPath = path.join(base, slug, '_course.json');
        const raw = await fs.readFile(jsonPath, 'utf8');
        const { entries } = JSON.parse(raw) as { entries: CourseEntry[] };

        entries
            .filter((e: CourseEntry) => e.visible !== false && e.type === 'module')
            .forEach((e: CourseEntry) =>
                params.push({ slug, mod: (e.path as string).replace(/^\/+/, '') })
            );
    };

    return params; // Next gerará /disciplinas/slug/mod para cada par
}
