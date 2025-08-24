// components/presentation/useViewMode.ts
'use client'
import { useEffect, useState } from 'react'

export type ViewMode = 'texto' | 'apresentacao'

// Lê o modo a partir de URL/localStorage – somente em ambiente cliente.
function readModeFromEnv(): ViewMode {
  try {
    const params = new URLSearchParams(window.location.search)
    const q = (params.get('view') as ViewMode) || null
    const saved = (localStorage.getItem('view-mode') as ViewMode) || null
    return (q || saved || 'texto') as ViewMode
  } catch {
    return 'texto'
  }
}

export function useViewMode(): ViewMode {
  // Inicia sempre com 'texto' tanto no servidor quanto no cliente para evitar
  // divergência de HTML durante a hidratação. Depois sincroniza.
  const [mode, setMode] = useState<ViewMode>('texto')

  // Sincroniza na montagem e em eventos de navegação/customizados.
  useEffect(() => {
    const sync = () => setMode(readModeFromEnv())
    sync() // primeira leitura real (montagem)
    window.addEventListener('popstate', sync)
    window.addEventListener('telaclass:view-mode', sync as any)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('telaclass:view-mode', sync as any)
    }
  }, [])

  // Persistência sempre que mudar.
  useEffect(() => {
    try { localStorage.setItem('view-mode', mode) } catch {}
  }, [mode])

  return mode
}

export function setViewMode(next: ViewMode) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('view', next)
  window.history.replaceState({}, '', url.toString())
  try { localStorage.setItem('view-mode', next) } catch {}
  // avisa outros componentes
  window.dispatchEvent(new Event('telaclass:view-mode'))
}