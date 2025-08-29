'use client'

import { useViewMode, setViewMode } from '@/components/presentation/useViewMode'
import { useEffect, useState } from 'react'

import { NotebookText, Presentation } from 'lucide-react';
import { ButtonIconOnly } from '@/components/button-icon-only';

export default function ViewToggle() {
  const mode = useViewMode()
  const [show, setShow] = useState(false)
  // Só exibe em telas >= md (>= 768px)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setShow(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  if (!show) return null
  const next = mode === 'apresentacao' ? 'texto' : 'apresentacao'

  const title = mode === 'apresentacao' ? 'Voltar ao modo texto' : 'Entrar no modo apresentação';
  return (
    <ButtonIconOnly
      ariaLabel={title}
      onClick={() => {
  setViewMode(next)
      }}
      // permanece visível apenas >= md via controle de render
    >
      <span className="hidden sm:inline">
        {mode === 'apresentacao' ? <NotebookText className="h-4 w-4" /> : <Presentation className="h-4 w-4" />}
      </span>
      <span className="sm:hidden">
  {mode === 'apresentacao' ? <NotebookText className="h-4 w-4" /> : <Presentation className="h-4 w-4" />}
      </span>
    </ButtonIconOnly>
  )
}