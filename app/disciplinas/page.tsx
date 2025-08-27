import Link from 'next/link';
import { listCourses } from '@/lib/content';
import { buttonVariants } from '@/components/ui/button';
import clsx from 'clsx';

export const dynamic = 'force-dynamic'; // garante leitura em runtime durante dev

export default async function DisciplinasIndex() {
  const cursos = await listCourses();
  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
        <p className="text-muted-foreground">Os conteúdos atualmente cadastrados são:</p>
      </header>
      {cursos.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma disciplina encontrada.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {cursos.map(c => (
          <Link
            key={c.slug}
            href={`/disciplinas/${c.slug}`}
            className={clsx(
              buttonVariants({ variant: 'secondary', size: 'lg' }),
              'justify-start h-auto py-6 flex flex-col items-start space-y-2 text-left'
            )}
          >
            <span className="font-semibold text-base leading-snug line-clamp-2">{c.title}</span>
      <span className="text-[10px] uppercase tracking-wide opacity-60">{c.code}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
