// app/disciplinas/[slug]/[mod]/page.tsx
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/content'; // mantém sua lógica de ler _course.json
import { MDX_MANIFEST } from '@/content/mdx-manifest';

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; mod: string }>;
  searchParams?: Record<string, string | string[]>;
}) {
  const { slug, mod } = await params;
  const dec = (s: string) => decodeURIComponent(s);
  const norm = (s: string) => dec(s).replace(/^\/+|\/+$/g, '');
  const cleanSlug = norm(slug);
  const cleanMod = norm(mod);

  console.log('[MDX PAGE] params:', { slug: cleanSlug, mod: cleanMod });

  // valida se slug/mod existem no _course.json
  const course = await getCourse(cleanSlug);
  const clean = (s: string) => norm(s);
  const entry = course.entries.find(
    (e) => clean(e.path) === clean(cleanMod) && e.type === 'module'
  );
  if (!entry) {
    console.warn('[MDX PAGE] module not found in _course.json:', {
      slug: cleanSlug,
      mod: cleanMod,
      coursePaths: course.entries?.map((e: any) => e.path),
    });
    notFound();
  }

  // decide qual arquivo abrir
  const view =
    (Array.isArray(searchParams?.view)
      ? searchParams?.view[0]
      : searchParams?.view) ?? 'texto';

  const preferred = view === 'slides' ? ['slides.mdx', 'texto.mdx'] : ['texto.mdx', 'slides.mdx'];
  const fallbacks = ['index.mdx', 'README.mdx'];

  const candidates = [
    ...preferred.map((f) => `/${cleanSlug}/${cleanMod}/${f}`),
    ...fallbacks.map((f) => `/${cleanSlug}/${cleanMod}/${f}`),
  ];

  const manifestKeys = Object.keys(MDX_MANIFEST);
  console.log('[MDX PAGE] candidates:', candidates);
  console.log('[MDX PAGE] manifest entries:', manifestKeys.length);

  // acha o 1º que existe no manifesto
  const key = candidates.find((k) => k in MDX_MANIFEST);
  if (!key) {
    const near = manifestKeys
      .filter((k) => k.startsWith(`/${cleanSlug}/${cleanMod}/`))
      .slice(0, 10);
    console.warn('[MDX PAGE] no matching MDX in manifest for candidates:', {
      candidates,
      suggestions: near,
    });
    notFound();
  }

  // importa e renderiza o MDX (compilado pelo plugin)
  const modImport = await MDX_MANIFEST[key]();
  const MDX = modImport.default;

  return (
    <div className="prose max-w-none">
      <MDX />
    </div>
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
          (e) => e.type === 'module' && e.visible !== false && typeof e.path === 'string'
        )
        .forEach((e) => params.push({ slug, mod: e.path.replace(/^\/+/, '') }));
    } catch {
      // sem _course.json — ignore
    }
  }

  return params;
}