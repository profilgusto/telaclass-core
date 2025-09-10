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
  // Separa entradas visíveis por categoria
  const entries = course.entries.filter(e => e.visible !== false && [
    'modulo-teorico', 'modulo-pratico', 'atividade-avaliativa', 'recurso'
  ].includes(e.type));
  const modTeoricos = entries.filter(e => e.type === 'modulo-teorico');
  const modPraticos = entries.filter(e => e.type === 'modulo-pratico');
  const atividades = entries.filter(e => e.type === 'atividade-avaliativa');
  const recursos = entries.filter(e => e.type === 'recurso');

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

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Módulos teóricos</h2>
          {modTeoricos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum módulo visível cadastrado.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modTeoricos.map((m) => (
              <Link
                key={m.id}
                href={`/disciplinas/${slug}/${m.path}`}
                className={clsx(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'justify-start h-auto py-4 flex flex-col items-start space-y-1 text-left !whitespace-normal break-words',
                  // Força override das cores (o variant outline injeta dark:bg-input/30 etc.)
                  '!bg-emerald-50 dark:!bg-emerald-950/30 !border-emerald-200 dark:!border-emerald-950/70 hover:!bg-emerald-100 dark:hover:!bg-emerald-950/50 transition-colors'
                )}
              >
                <span className="font-bold text-xs uppercase tracking-wide opacity-70 text-emerald-900 dark:text-emerald-200">{m.number ? `Módulo ${m.number}` : 'Módulo'}</span>
                <span className="font-medium leading-snug line-clamp-2 break-words whitespace-normal text-emerald-950 dark:text-emerald-100">{m.title}</span>
              </Link>
            ))}
          </div>
        </div>
        {modPraticos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Módulos práticos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {modPraticos.map(m => (
                <Link
                  key={m.id}
                  href={`/disciplinas/${slug}/${m.path}`}
                  className={clsx(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'justify-start h-auto py-4 flex flex-col items-start space-y-1 text-left !whitespace-normal break-words',
                    '!bg-emerald-50 dark:!bg-emerald-950/30 !border-emerald-200 dark:!border-emerald-950/70 hover:!bg-emerald-100 dark:hover:!bg-emerald-950/50 transition-colors'
                  )}
                >
                  <span className="font-bold text-xs uppercase tracking-wide opacity-70 text-emerald-900 dark:text-emerald-200">{m.number ? `Módulo ${m.number}` : 'Módulo'}</span>
                  <span className="font-medium leading-snug line-clamp-2 break-words whitespace-normal text-emerald-950 dark:text-emerald-100">{m.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {atividades.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Atividades avaliativas</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {atividades.map(a => (
                <Link
                  key={a.id}
                  href={`/disciplinas/${slug}/${a.path}`}
                  className={clsx(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'justify-start h-auto py-4 flex flex-col items-start space-y-1 text-left !whitespace-normal break-words',
                    // Força override das cores (o variant outline injeta dark:bg-input/30 etc.)
                    '!bg-indigo-50 dark:!bg-indigo-950/30 !border-indigo-200 dark:!border-indigo-950/70 hover:!bg-indigo-100 dark:hover:!bg-indigo-950/50 transition-colors'
                  )}
                >
                  <span className="font-bold text-xs uppercase tracking-wide opacity-70 text-indigo-900 dark:text-indigo-200">Atividade</span>
                  <span className="font-medium leading-snug line-clamp-2 break-words whitespace-normal text-indigo-950 dark:text-indigo-100">{a.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {recursos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Recursos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recursos.map(r => (
                <Link
                  key={r.id}
                  href={`/disciplinas/${slug}/${r.path}`}
                  className={clsx(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'justify-start h-auto py-4 flex flex-col items-start space-y-1 text-left !whitespace-normal break-words',
                    '!bg-slate-50 dark:!bg-slate-800/40 !border-slate-200 dark:!border-slate-700 hover:!bg-slate-100 dark:hover:!bg-slate-800/60 transition-colors'
                  )}
                >
                  <span className="font-bold text-xs uppercase tracking-wide opacity-70 text-slate-700 dark:text-slate-300">Recurso</span>
                  <span className="font-medium leading-snug line-clamp-2 break-words whitespace-normal text-slate-900 dark:text-slate-100">{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}