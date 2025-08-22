'use client'

import { useViewMode, setViewMode } from '@/components/presentation/useViewMode'

import { NotebookText, Presentation } from 'lucide-react';

export default function ViewToggle() {
  const mode = useViewMode()
  const next = mode === 'apresentacao' ? 'texto' : 'apresentacao'

  return (
    <button
      type="button"
      onClick={() => {
        setViewMode(next)
        // Como o hook atual lê o modo na montagem, o reload garante consistência.
        window.location.reload()
      }}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
      aria-pressed={mode === 'apresentacao'}
      title={mode === 'apresentacao' ? 'Voltar ao modo texto' : 'Entrar no modo apresentação'}
    >
      <span className="hidden sm:inline">
        {mode === 'apresentacao' ? <NotebookText className="h-4 w-4" /> : <Presentation className="h-4 w-4" />}
      </span>
      <span className="sm:hidden">
        {mode === 'apresentacao' ? 'Texto' : 'Slides'}
      </span>
    </button>
  )
}