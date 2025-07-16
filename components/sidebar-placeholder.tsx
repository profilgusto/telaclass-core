export function SidebarPlaceholder() {
    return(
        <nav className="p-[var(--space-md)] space-y-[var(--space-sm)] text-sm">
            <p className="font-medium mb-[var(--space-sm)]">Módulos (mock)</p>
            <ul className="space-y-[var(--space-xs)]">
                <li>01 – Apresentação</li>
                <li>02 – Histórico</li>
                <li>…</li>
            </ul>
        </nav>
    );
};