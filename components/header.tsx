'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import ViewToggle from '@/components/presentation/ViewToggle';

import { MobileSidebar } from '@/components/mobile-sidebar';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);          // controla o Drawer

  const links = [
    { href: '/', label: 'Início' },
    { href: '/disciplinas', label: 'Disciplinas' },
    { href: '/sobre', label: 'Sobre' },
  ];

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
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Content Presentation view toggle */}
        <ViewToggle />

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