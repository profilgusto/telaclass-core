export function Footer () {
    return (
    <footer className="border-t border-border bg-background text-sm">
      <div className="mx-auto max-w-screen-2xl px-[var(--space-md)] py-[var(--space-sm)]
                      flex flex-col sm:flex-row items-center justify-between gap-[var(--space-sm)]">
        <span>© {new Date().getFullYear()} Telaclass · UFSJ</span>
        <a
          href="https://github.com/filgusto/telaclass"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Código-fonte
        </a>
      </div>
    </footer>
    );
}