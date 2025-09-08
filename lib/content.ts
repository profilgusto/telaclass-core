import fs from 'fs/promises';
import path from 'path';
// Simplified AST tooling imports (static) for heading extraction
import { extractHeadingsFromSource } from './mdx-pipeline';

const base = path.join(process.cwd(), 'content/disciplinas');

/** Tipos utilitarios */
export type CourseEntry = {
    /** Chave única da entrada (pode ser numérica ou alfanumérica) */
    id: string;
    /** Natureza do item: módulo de conteúdo, atividade, informação, etc. */
    type: 'module' | 'activity' | 'info' | string;
    /** Título visível no sidebar e cabeçalhos */
    title: string;
  /** Slug / subpasta onde reside content.mdx */
    path: string;
    /** Flag de publicação; false oculta do menu e do SSG */
    visible?: boolean;
    /** Número atribuído dinamicamente quando `type === "module"` e `visible !== false` */
    number?: number | null;
};

export type CourseWorkload = {
  theoretical?: number;
  practical?: number;
};

export type Course = {
  code: string;
  title: string;
  entries: CourseEntry[];
  /** Resumo opcional exibido na home da disciplina */
  summary?: string;
  /** Carga horária (parcial) */
  workload?: CourseWorkload;
  /** Campos adicionais dinâmicos */
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
    // Normaliza campos opcionais conhecidos (para evitar 'unknown' em TS no build)
    const summary = typeof data.summary === 'string' ? data.summary : undefined;
    const workload: CourseWorkload | undefined = data.workload && typeof data.workload === 'object'
      ? {
          theoretical: typeof data.workload.theoretical === 'number' ? data.workload.theoretical : undefined,
          practical: typeof data.workload.practical === 'number' ? data.workload.practical : undefined,
        }
      : undefined;

    return { ...(data as any), summary, workload, entries } as Course;
};

/** Lista cursos existentes (pastas que contenham _course.json) retornando slug, título e código */
export async function listCourses(): Promise<{ slug: string; title: string; code: string }[]> {
  const dirents = await fs.readdir(base, { withFileTypes: true }).catch(() => []);
  const out: { slug: string; title: string; code: string }[] = [];
  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    const slug = d.name;
    if (slug.startsWith('.')) continue; // ignora ocultos
    try {
      const jsonPath = path.join(base, slug, '_course.json');
      const raw = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(raw);
      const code: string = data.code || slug;
      const title: string = data.title || code || slug;
      out.push({ slug, title, code });
    } catch {
      // ignora pastas sem _course.json válido
      continue;
    }
  }
  // ordena alfabeticamente pelo título
  out.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  return out;
}

/** Carrega conteúdo canônico (content.mdx) **/
export async function getModule(
  courseSlug: string,
  entryPath: string
): Promise<{ content?: string }> {
  const dir = path.join(base, courseSlug, entryPath);
  const files: string[] = (await fs.readdir(dir).catch(() => [])) as string[];
  const out: { content?: string } = {};
  const read = async (file: string) => fs.readFile(path.join(dir, file), 'utf8');
  if (files.includes('content.mdx')) {
    out.content = await read('content.mdx');
  }
  return out;
}

/** Extrai headings (h2) do arquivo principal de texto do módulo para navegação lateral */
export async function getModuleHeadings(
  courseSlug: string,
  entryPath: string
): Promise<Array<{ id: string; text: string }>> {
  const dir = path.join(base, courseSlug, entryPath);
  const filePath = path.join(dir, 'content.mdx');
  try {
    await fs.access(filePath);
  } catch {
    return [];
  }
  const raw = await fs.readFile(filePath, 'utf8');
  return extractHeadingsFromSource(raw);
}