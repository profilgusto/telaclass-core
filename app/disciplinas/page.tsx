import Link from 'next/link';
import { listCourses } from '@/lib/content';

export const dynamic = 'force-dynamic'; // garante leitura em runtime durante dev

export default async function DisciplinasIndex() {
  const cursos = await listCourses();
  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
        <p className="text-muted-foreground">Os conteúdos atualmente cadastrados são:</p>
      </header>
      <ul className="space-y-3 list-disc pl-6">
        {cursos.length === 0 && (
          <li className="list-none pl-0 text-sm text-muted-foreground">Nenhuma disciplina encontrada.</li>
        )}
        {cursos.map(c => (
          <li key={c.slug}>
            <Link href={`/disciplinas/${c.slug}`} className="underline hover:no-underline">
              {c.title} <span className="text-xs text-muted-foreground">({c.slug})</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
