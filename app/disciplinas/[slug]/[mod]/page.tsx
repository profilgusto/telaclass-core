// app/disciplinas/[slug]/[mod]/page.tsx
import { notFound } from 'next/navigation';
import { getCourse, getModuleHeadings } from '@/lib/content';
import { MDX_MANIFEST } from '@/content/mdx-manifest';
import { ModulePageClient } from '@/components/ModulePageClient';

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string; mod: string }>;
}) {
  const { slug, mod } = await params;
  const dec = (s: string) => decodeURIComponent(s);
  const norm = (s: string) => dec(s).replace(/^\/+|\/+$/g, '');
  const cleanSlug = norm(slug);
  const cleanMod = norm(mod);

  const course = await getCourse(cleanSlug);
  // Aceita tanto módulos quanto atividades (compartilham mesma infra de renderização)
  const entry = course.entries.find(
    (e) => norm(e.path) === cleanMod && (e.type === 'module' || e.type === 'activity')
  );
  if (!entry) {
    notFound();
  }
  // Always expect a single canonical MDX file: content.mdx
  const manifestKey = `/${cleanSlug}/${cleanMod}/content.mdx`;
  if (!(manifestKey in MDX_MANIFEST)) {
    notFound();
  }
  const headings = await getModuleHeadings(cleanSlug, cleanMod);

  return (
    <ModulePageClient
      course={course}
      slug={cleanSlug}
      mod={cleanMod}
      manifestKey={manifestKey}
      headings={headings}
    />
  );
}

/** Geração estática das rotas com base nos _course.json */
export async function generateStaticParams() {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const base = path.join(process.cwd(), 'content/disciplinas');
  const disciplinas = await fs
    .readdir(base, { withFileTypes: true })
    .then((list) => list.filter((d) => d.isDirectory()).map((d) => d.name));

  const params: { slug: string; mod: string }[] = [];

  for (const slug of disciplinas) {
    const jsonPath = path.join(base, slug, '_course.json');
    try {
      const raw = await fs.readFile(jsonPath, 'utf8');
      const { entries } = JSON.parse(raw) as {
        entries: Array<{ type: string; path: string; visible?: boolean }>;
      };

      entries
        .filter(
          (e) => (e.type === 'module' || e.type === 'activity') && e.visible !== false && typeof e.path === 'string'
        )
        .forEach((e) => params.push({ slug, mod: e.path.replace(/^\/+/, '') }));
    } catch {
      // sem _course.json — ignore
    }
  }

  return params;
}