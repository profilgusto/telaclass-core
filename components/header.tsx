'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import ViewToggle from '@/components/presentation/ViewToggle';
import { ButtonIconOnly } from '@/components/button-icon-only';
import { CourseSidebar } from '@/components/course-sidebar';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { useEffect, useState as useReactState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);          // controla o Drawer
  const [courseSlug, setCourseSlug] = useReactState<string | null>(null);
  const [courseData, setCourseData] = useReactState<any>(null);

  const links = [
    { href: '/disciplinas', label: 'Disciplinas' },
  ];

  // Página de módulo: /disciplinas/<slug>/<mod> (exatamente 3 partes não vazias)
  const parts = pathname.split('/').filter(Boolean);
  const isModulePage = parts.length === 3 && parts[0] === 'disciplinas';
  useEffect(() => {
    if (isModulePage) {
      setCourseSlug(parts[1]);
    } else {
      setCourseSlug(null);
    }
  }, [pathname]);
  useEffect(() => {
    if (!courseSlug) { setCourseData(null); return; }
    fetch(`/api/course?slug=${encodeURIComponent(courseSlug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setCourseData(data))
      .catch(() => setCourseData(null));
  }, [courseSlug]);

  return (
    <header
      className="sticky top-0 z-[var(--z-overlay)] bg-[var(--sidebar)]
                 text-[var(--sidebar-foreground)] border-b border-[var(--sidebar-border)]"
    >
      <div
        className="mx-auto flex h-14 max-w-screen-2xl items-center
                   px-[var(--space-lg)] gap-[var(--space-lg)]"
      >
        {/* Logo */}
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Telaclass
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden md:flex gap-[var(--space-md)] ml-[var(--space-lg)]">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm hover:underline ${
                pathname === href ? 'font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Espaço elástico empurra os ícones para a direita */}
        <div className="flex-1" />

        {/* Botão hamburger (só mobile) */}
        {/* Botão hamburger só em mobile (< md) */}
        <div className="md:hidden">
          <ButtonIconOnly
            ariaLabel="Abrir menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </ButtonIconOnly>
        </div>

  {/* Content Presentation view toggle (apenas em páginas de módulo) */}
  {isModulePage && <ViewToggle />}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Drawer mobile */}
        <MobileSidebar open={open} setOpen={setOpen} >
          <div className='p-4 space-y-4 text-sm'>
            <nav className='space-x-4'>
              <Link href='/' onClick={() => setOpen(false)}>Início</Link>
              <Link href='/disciplinas' onClick={() => setOpen(false)}>Disciplinas</Link>
              <Link href='/sobre' onClick={() => setOpen(false)}>Sobre</Link>
            </nav>
            {isModulePage && courseData && (
              <div className='border-t pt-4'>
                <p className='mb-2 font-medium text-xs uppercase tracking-wide text-muted-foreground'>Módulos</p>
                {/* Reuso direto do componente de sidebar */}
                <CourseSidebar course={courseData} slug={courseSlug as string} />
              </div>
            )}
          </div>
        </MobileSidebar>

      </div>
    </header>
  );
}