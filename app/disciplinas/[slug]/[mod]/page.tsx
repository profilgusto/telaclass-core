// app/disciplinas/[slug]/[mod]/page.tsx
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/content'; // mantém sua lógica de ler _course.json
import { MDX_MANIFEST } from '@/content/mdx-manifest';
import Link from 'next/link';
import MdxRenderer from '@/components/presentation/MdxRenderer';

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

  //console.log('[MDX PAGE] params:', { slug: cleanSlug, mod: cleanMod });

  // valida se slug/mod existem no _course.json
  const course = await getCourse(cleanSlug);
  const entry = course.entries.find(
    (e) => norm(e.path) === cleanMod && e.type === 'module'
  );
  if (!entry) {
    console.warn('[MDX PAGE] module not found in _course.json:', {
      slug: cleanSlug,
      mod: cleanMod,
      coursePaths: course.entries?.map((e: any) => e.path),
    });
    notFound();
  }

  // decide qual arquivo abrir (apenas um MDX por módulo)
  const preferred = ['texto.mdx'];
  const fallbacks = ['index.mdx', 'README.mdx'];

  const candidates = [
    ...preferred.map((f) => `/${cleanSlug}/${cleanMod}/${f}`),
    ...fallbacks.map((f) => `/${cleanSlug}/${cleanMod}/${f}`),
  ];

  const manifestKeys = Object.keys(MDX_MANIFEST);
  //console.log('[MDX PAGE] candidates:', candidates);
  //console.log('[MDX PAGE] manifest entries:', manifestKeys.length);

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
  const { default: MDX } = await MDX_MANIFEST[key]();

  // Transforma src relativo em /disciplinas/{slug}/{mod}/file/...
  const Img = (
    { src, alt, ...rest }: { src?: string; alt?: string } & Record<string, any>
  ) => {
    const s = typeof src === 'string' ? src : '';
    const isAbsolute = /^([a-z]+:)?\/\//i.test(s) || s.startsWith('/');

    // se for só o nome (sem barra), assume subpasta "img/"
    const normalized = !isAbsolute
      ? `${s.includes('/') ? s : `img/${s}`}`.replace(/^\.?\/*/, '')
      : s;

    // encode seguro de cada segmento
    const encoded = normalized.split('/').map(encodeURIComponent).join('/');

    const url = isAbsolute
      ? s
      : `/disciplinas/${encodeURIComponent(cleanSlug)}/${encodeURIComponent(cleanMod)}/${encoded}`;

    return <img src={url} alt={alt ?? ''} {...rest} />;
  };

  // Reescreve href relativo para /disciplinas/{slug}/{mod}/{...}
  const A = (
    { href, children, ...rest }: { href?: string } & Record<string, any>
  ) => {
    const h = typeof href === 'string' ? href : '';
    // Absoluto (http/https) ou root-absolute (começa com /) → não mexe
    const isAbsolute = /^([a-z]+:)?\/\//i.test(h) || h.startsWith('/');
    if (isAbsolute) {
      const external = /^https?:\/\//i.test(h);
      if (external) {
        return (
          <a href={h} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }} {...rest}>
            {children}
          </a>
        );
      }
      return (
        <Link href={h} style={{ textDecoration: 'underline' }} {...(rest as any)}>
          {children}
        </Link>
      );
    }
    // Relativo (não começa com /): remove ./ inicial e codifica segmentos
    const normalized = h.replace(/^\.\/+/, '');
    const encoded = normalized.split('/').map(encodeURIComponent).join('/');
    const url = `/disciplinas/${encodeURIComponent(cleanSlug)}/${encodeURIComponent(cleanMod)}/${encoded}`;
    return (
      <Link href={url} style={{ textDecoration: 'underline' }} {...(rest as any)}>
        {children}
      </Link>
    );
  };

  return (
    <MdxRenderer
      manifestKey={key}
      slug={cleanSlug}
      mod={cleanMod}
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
          (e) => e.type === 'module' && e.visible !== false && typeof e.path === 'string'
        )
        .forEach((e) => params.push({ slug, mod: e.path.replace(/^\/+/, '') }));
    } catch {
      // sem _course.json — ignore
    }
  }

  return params;
}