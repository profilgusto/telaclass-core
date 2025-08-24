'use client'

import { useViewMode, setViewMode } from '@/components/presentation/useViewMode'

import { NotebookText, Presentation } from 'lucide-react';
import { ButtonIconOnly } from '@/components/button-icon-only';

export default function ViewToggle() {
  const mode = useViewMode()
  const next = mode === 'apresentacao' ? 'texto' : 'apresentacao'

  const title = mode === 'apresentacao' ? 'Voltar ao modo texto' : 'Entrar no modo apresentação';
  return (
    <ButtonIconOnly
      ariaLabel={title}
      onClick={() => {
  setViewMode(next)
      }}
    >
      <span className="hidden sm:inline">
        {mode === 'apresentacao' ? <NotebookText className="h-4 w-4" /> : <Presentation className="h-4 w-4" />}
      </span>
      <span className="sm:hidden">
  {mode === 'apresentacao' ? 'Texto' : 'Slides'}
      </span>
    </ButtonIconOnly>
  )
}