'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import ViewToggle from '@/components/presentation/ViewToggle';
import { ButtonIconOnly } from '@/components/button-icon-only';

import { MobileSidebar } from '@/components/mobile-sidebar';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);          // controla o Drawer

  const links = [
    { href: '/disciplinas', label: 'Disciplinas' },
  ];

  // Página de módulo: /disciplinas/<slug>/<mod> (exatamente 3 partes não vazias)
  const parts = pathname.split('/').filter(Boolean);
  const isModulePage = parts.length === 3 && parts[0] === 'disciplinas';

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
        <ButtonIconOnly
          ariaLabel="Abrir menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </ButtonIconOnly>

  {/* Content Presentation view toggle (apenas em páginas de módulo) */}
  {isModulePage && <ViewToggle />}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Drawer mobile */}
        <MobileSidebar open={open} setOpen={setOpen} >
          <nav className='p-4 space-x-4 text-sm'>
            <Link href='/' onClick={() => setOpen(false)}>Início</Link>
            <Link href='/disciplinas' onClick={() => setOpen(false)}>Disciplinas</Link>
            <Link href='/sobre' onClick={() => setOpen(false)}>Sobre</Link>
          </nav>
        </MobileSidebar>

      </div>
    </header>
  );
}