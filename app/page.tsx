import { redirect } from 'next/navigation';

// Redireciona a página inicial para /disciplinas
export default function Home() {
  redirect('/disciplinas');
}