import fs from 'fs/promises';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc'

const base = path.join(process.cwd(), 'content');

/** Tipos utilitarios */
export type CourseEntry = {
    /** Chave única da entrada (pode ser numérica ou alfanumérica) */
    id: string;
    /** Natureza do item: módulo de conteúdo, atividade, informação, etc. */
    type: 'module' | 'activity' | 'info' | string;
    /** Título visível no sidebar e cabeçalhos */
    title: string;
    /** Slug / subpasta onde residem texto.mdx e slides.mdx */
    path: string;
    /** Flag de publicação; false oculta do menu e do SSG */
    visible?: boolean;
    /** Número atribuído dinamicamente quando `type === "module"` e `visible !== false` */
    number?: number | null;
};

export type Course = {
    code: string;
    title: string;
    entries: CourseEntry[];
    [k: string]: unknown;
};

/** Lê _course.json, aplica numeração automática apenas aos módulos visíveis **/
export async function getCourse(slug: string): Promise<Course> {
    const jsonPath = path.join(base, slug, '_course.json');
    const raw = await fs.readFile(jsonPath, 'utf8'); 
    const data = JSON.parse(raw);

    let moduleCounter = 1;
    const entries = data.entries.map((e: CourseEntry) => {
        const visible = e.visible !== false;
        return {
            ...e,
            visible,
            number:
                visible && e.type === 'module'
                    ? moduleCounter++               // numerar
                    : null,
        };
    });
    return { ...data, entries};
};

/** Carrega texto.mdx e/ou slides.mdx de uma entrada **/
export async function getModule(
  courseSlug: string,
  entryPath: string
): Promise<{ texto?: string; slides?: string }> {
  const dir = path.join(base, courseSlug, entryPath);
  const files: string[] = (await fs.readdir(dir).catch(() => [])) as string[];

  const out: { texto?: string; slides?: string } = {};

  /** Helper para compilar e extrair a string do MDX */
  const compileSource = async (filePath: string): Promise<string> => {
    const mdx = await fs.readFile(filePath, 'utf8');
    // O resultado do compileMDX muda entre versões:
    // - v4: { code: string }
    // - v5: { compiledSource: string }
    // - future: { content: string }
    // Usamos fallback encadeado para cobrir todas.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compiled: any = await compileMDX({ source: mdx });
    return (
      compiled?.compiledSource ??
      compiled?.content ??
      compiled?.code ??
      ''
    );
  };

  if (files.includes('texto.mdx')) {
    out.texto = await compileSource(path.join(dir, 'texto.mdx'));
  }

  if (files.includes('slides.mdx')) {
    out.slides = await compileSource(path.join(dir, 'slides.mdx'));
  }

  return out;
}