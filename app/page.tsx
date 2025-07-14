import Image from "next/image";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
        <div className="ml-auto">
          <ThemeToggle />
        </div>

        <div>
          <Button variant='default'>Olá, Julia!</Button>
        </div>

      <Button
        className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-foreground)] text-[hsl(222_47%_11%)] rounded-[var(--radius-md)]"
      >
        Botão Tokenizado
      </Button>
        
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
