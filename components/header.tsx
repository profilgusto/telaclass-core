'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu } from 'lucide-react';
import { useMediaQuery } from '@/lib/use-media-query';
import { MobileSidebar } from '@/components/mobile-sidebar';

export function Header() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Início' },
        { href: '/disciplinas', label: 'Disciplinas' },
        { href: '/sobre', label: 'Sobre' },
    ];

    return (
    <header className="sticky top-0 z-[var(--z-overlay)] bg-[var(--sidebar)]
                        text-[var(--sidebar-foreground)] border-b
                        border-[var(--sidebar-border)]">
                            
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-[var(--space-md)] gap-[var(--space-lg)]">
        {/* Logo / marca */}
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Telaclass
        </Link>

        {/* Navegação (desktop) */}
        <nav className="hidden md:flex gap-[var(--space-md)]">
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

        {/* “hamburger” para mobile */}
        {!open && (
          <button onClick={() => setOpen(true)} className="md:hidden p-2">
            <Menu className="h-5 w-5" />
          </button>
        )}

        <MobileSidebar />
        

        {/* Botão sanduiche do menu lateral */}
        {!isOpen && (
          <button 
            onClick={() => setOpen(true)}
            className='md:hidden p-2 rounded hover:bg-gray-100'
            aria-label='Abrir menu'
          >
            <Menu className='h-5 w-5' />
          </button>
        )}

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
    );
}
