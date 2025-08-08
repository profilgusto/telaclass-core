import fs from 'fs/promises';
import path from 'path';

const base = path.join(process.cwd(), 'content/disciplinas');

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

/** Carrega texto.mdx e/ou slides.mdx de uma entrada (RSC-friendly: retorna string crua) **/
export async function getModule(
  courseSlug: string,
  entryPath: string
): Promise<{ texto?: string; slides?: string }> {
  
  const dir = path.join(base, courseSlug, entryPath);
  const files: string[] = (await fs.readdir(dir).catch(() => [])) as string[];

  const out: { texto?: string; slides?: string } = {};

  const read = async (file: string) =>
    fs.readFile(path.join(dir, file), 'utf8');

  if (files.includes('texto.mdx')) {
    out.texto = await read('texto.mdx');
  }

  if (files.includes('slides.mdx')) {
    out.slides = await read('slides.mdx');
  }

  return out;
}