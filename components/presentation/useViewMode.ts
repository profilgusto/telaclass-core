// components/presentation/useViewMode.ts
'use client'
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react'

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

// Contexto opcional para sobrescrever o modo vindo de cima (evita flash).
const ViewModeOverrideContext = createContext<ViewMode | null>(null)

export function useViewMode(): ViewMode {
  const override = useContext(ViewModeOverrideContext)
  if (override) return override
  // Fallback: comportamento dinâmico global.
  const [mode, setMode] = useState<ViewMode>('texto')
  useEffect(() => {
    const sync = () => setMode(readModeFromEnv())
    sync()
    window.addEventListener('telaclass:view-mode', sync as any)
    return () => window.removeEventListener('telaclass:view-mode', sync as any)
  }, [])
  useEffect(() => {
    try { localStorage.setItem('view-mode', mode) } catch {}
  }, [mode])
  return mode
}

export function ViewModeProvider({ mode, children }: { mode: ViewMode; children: ReactNode }) {
  return React.createElement(ViewModeOverrideContext.Provider, { value: mode }, children)
}

export function setViewMode(next: ViewMode) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('view-mode', next) } catch {}
  window.dispatchEvent(new Event('telaclass:view-mode'))
}