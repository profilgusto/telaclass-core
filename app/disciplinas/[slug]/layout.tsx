import type { ReactNode } from 'react';

export default async function DisciplinaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  await params;
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}