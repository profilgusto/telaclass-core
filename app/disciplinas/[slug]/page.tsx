import { getCourse } from '@/lib/content';
import ButtonModules from '@/components/button-modules';

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
              <ButtonModules
                key={m.id}
                href={`/disciplinas/${slug}/${m.path}`}
                badge={m.number ? `Módulo teórico ${m.number}` : 'Módulo teórico'}
                title={m.title}
                colorTailWind="emerald"
              />
            ))}
          </div>
        </div>
    {modPraticos.length > 0 && ( 
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Módulos práticos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {modPraticos.map(m => (
                <ButtonModules
                  key={m.id}
                  href={`/disciplinas/${slug}/${m.path}`}
                  badge={m.number ? `Módulo prático ${m.number}` : 'Módulo prático'}
                  title={m.title}
                  colorTailWind="lime"
                />
              ))}
            </div>
          </div>
        )}
        {atividades.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Atividades avaliativas</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {atividades.map(a => (
                <ButtonModules
                  key={a.id}
                  href={`/disciplinas/${slug}/${a.path}`}
                  badge="Atividade"
                  title={a.title}
                  colorTailWind="amber"
                />
              ))}
            </div>
          </div>
        )}
        {recursos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Recursos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recursos.map(r => (
                <ButtonModules
                  key={r.id}
                  href={`/disciplinas/${slug}/${r.path}`}
                  badge="Recurso"
                  title={r.title}
                  colorTailWind="indigo"
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}