import type { ReactNode } from 'react';
import { SidebarPlaceholder } from '@/components/sidebar-placeholder';

export default function DisciplinaLayout({children}: {children: ReactNode;}) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar (66 % largura no mobile ocultaremos via Drawer) */}
            <aside
                className="hidden md:block w-60 shrink-0 border-r
                        border-border bg-[var(--sidebar)]
                        text-[var(--sidebar-foreground)]"
            >
                <SidebarPlaceholder />
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 px-[var(--space-lg)] py-[var(--space-md)]">
                {children}
            </main>
        </div>
    );
};