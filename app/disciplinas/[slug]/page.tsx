import Link from 'next/link';
import { getCourse } from '@/lib/content';
import { buttonVariants } from '@/components/ui/button';
import clsx from 'clsx';

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((m) => (
            <Link
              key={m.id}
              href={`/disciplinas/${slug}/${m.path}`}
              className={clsx(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                // Override base button whitespace-nowrap (use ! to ensure precedence)
                'justify-start h-auto py-4 flex flex-col items-start space-y-1 text-left !whitespace-normal break-words'
              )}
            >
              <span className="text-xs uppercase tracking-wide opacity-60">{m.number ? `Módulo ${m.number}` : 'Módulo'}</span>
              <span className="font-medium leading-snug line-clamp-2 break-words whitespace-normal">{m.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}