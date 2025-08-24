import Link from 'next/link';
import { getCourse } from '@/lib/content';

export default async function DisciplinaHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  const modules = course.entries.filter(
    (e) => e.type === 'module' && e.visible !== false
  );

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {course.title || slug}
        </h1>
        {course.summary && (
          <p className="text-muted-foreground max-w-prose">
            {course.summary}
          </p>
        )}
        <div className="text-xs text-muted-foreground flex gap-4 flex-wrap">
          {course.code && <span>Código: {course.code}</span>}
          {typeof course.workload?.theoretical === 'number' && (
            <span>
              Carga teórica: {course.workload.theoretical}h
            </span>
          )}
          {typeof course.workload?.practical === 'number' && (
            <span>
              Carga prática: {course.workload.practical}h
            </span>
          )}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Módulos</h2>
        {modules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum módulo visível cadastrado.
          </p>
        )}
        <ol className="space-y-2 list-decimal pl-5">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/disciplinas/${slug}/${m.path}`}
                className="underline hover:no-underline"
              >
                {m.number ? `${m.number}. ` : ''}{m.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}