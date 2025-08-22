// components/presentation/useViewMode.ts
'use client'
import { useEffect, useState } from 'react'

export type ViewMode = 'texto' | 'apresentacao'

function getInitialMode(): ViewMode {
  if (typeof window === 'undefined') return 'texto'
  const params = new URLSearchParams(window.location.search)
  const q = (params.get('view') as ViewMode) || null
  const saved = (localStorage.getItem('view-mode') as ViewMode) || null
  return (q || saved || 'texto') as ViewMode
}

export function useViewMode(): ViewMode {
  const [mode, setMode] = useState<ViewMode>(getInitialMode)

  useEffect(() => {
    // manter persistência
    localStorage.setItem('view-mode', mode)
  }, [mode])

  useEffect(() => {
    const onPop = () => setMode(getInitialMode())
    const onCustom = () => setMode(getInitialMode())
    window.addEventListener('popstate', onPop)
    window.addEventListener('telaclass:view-mode', onCustom as any)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('telaclass:view-mode', onCustom as any)
    }
  }, [])

  return mode
}

export function setViewMode(next: ViewMode) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('view', next)
  window.history.replaceState({}, '', url.toString())
  localStorage.setItem('view-mode', next)
  // avisa outros componentes
  window.dispatchEvent(new Event('telaclass:view-mode'))
}