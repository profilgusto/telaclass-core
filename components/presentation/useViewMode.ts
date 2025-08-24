// components/presentation/useViewMode.ts
'use client'
import { useEffect, useState } from 'react'

export type ViewMode = 'texto' | 'apresentacao'

// Lê o modo apenas do localStorage (cliente).
function readModeFromEnv(): ViewMode {
  try {
    const saved = (localStorage.getItem('view-mode') as ViewMode) || null
    return (saved || 'texto') as ViewMode
  } catch {
    return 'texto'
  }
}

export function useViewMode(): ViewMode {
  // Inicia sempre com 'texto' tanto no servidor quanto no cliente para evitar
  // divergência de HTML durante a hidratação. Depois sincroniza.
  const [mode, setMode] = useState<ViewMode>('texto')

  // Sincroniza na montagem e em eventos customizados.
  useEffect(() => {
    const sync = () => setMode(readModeFromEnv())
    sync() // primeira leitura real (montagem)
    window.addEventListener('telaclass:view-mode', sync as any)
    return () => {
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
  try { localStorage.setItem('view-mode', next) } catch {}
  window.dispatchEvent(new Event('telaclass:view-mode'))
}