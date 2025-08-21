'use client'
import { useEffect, useMemo, useState } from 'react'

export type ViewMode = 'texto' | 'apresentacao'

export function useViewMode(): ViewMode {
  const [mode, setMode] = useState<ViewMode>('texto')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = (params.get('view') as ViewMode) || null
    const saved = (localStorage.getItem('view-mode') as ViewMode) || null
    const next = (q || saved || 'texto') as ViewMode
    setMode(next)
    if (q) localStorage.setItem('view-mode', next)
  }, [])

  return mode
}

export function setViewMode(next: ViewMode) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('view', next)
  window.history.replaceState({}, '', url.toString())
  localStorage.setItem('view-mode', next)
}