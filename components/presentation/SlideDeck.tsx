'use client'

import { useEffect, useRef, useState } from 'react'
import { useViewMode } from './useViewMode'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { ButtonIconOnly } from '@/components/button-icon-only'

// Simplified SlideDeck: slides já vêm pré-segmentados pelo plugin (Slide data-id="...").

export default function SlideDeck({ children }: { children: ReactNode }) {
  const mode = useViewMode()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [index, setIndex] = useState(0)
  const [ids, setIds] = useState<string[]>([])
  const [title, setTitle] = useState('')

  // Coleta de slides (sem mutar DOM)
  useEffect(() => {
    if (mode !== 'apresentacao') return
    const root = containerRef.current
    if (!root) return
    const sections: HTMLElement[] = Array.from(root.querySelectorAll('section[data-id]'))
    setIds(sections.map(s => s.dataset.id || '').filter(Boolean))
    // título = primeiro h1
    const h1 = root.querySelector('h1')
    if (h1) setTitle(h1.textContent?.trim() || '')
    // Intro slide styling (only once)
    if (sections.length && !sections[0].dataset.introProcessed) {
      const first = sections[0]
      const firstH1 = first.querySelector('h1')
      if (firstH1) {
        first.classList.add('intro-slide','flex','flex-col','items-center','justify-center','min-h-[60vh]','text-center')
        firstH1.classList.add('text-5xl','sm:text-6xl','font-bold','text-center','mb-6')
        // Wrap remaining non-h1 direct children into a subtitle wrapper for consistent layout
        const rest = Array.from(first.children).filter(c => c !== firstH1)
        if (rest.length) {
          const wrapper = document.createElement('div')
            ;(wrapper.className = 'mt-2 text-xl text-center leading-relaxed space-y-4 max-w-3xl')
          rest.forEach(node => wrapper.appendChild(node))
          first.appendChild(wrapper)
        }
        first.dataset.introProcessed = 'true'
      }
    }
    // hash inicial
    const hash = window.location.hash.replace(/^#/, '')
    if (hash) {
      const idx = sections.findIndex(s => s.dataset.id === hash)
      if (idx >= 0) setIndex(idx)
    }
    // listeners de teclado
    const onKey = (e: KeyboardEvent) => {
      const max = Math.max(0, sections.length - 1)
      if (['ArrowRight','PageDown'].includes(e.key)) setIndex(i => Math.min(i + 1, max))
      if (['ArrowLeft','PageUp'].includes(e.key)) setIndex(i => Math.max(i - 1, 0))
      if (e.key === 'Home') setIndex(0)
      if (e.key === 'End') setIndex(Math.max(0, max))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, children])

  // aplica visibilidade sempre que o índice mudar
  useEffect(() => {
    if (mode !== 'apresentacao') return
    const root = containerRef.current
    if (!root) return
    const sections: HTMLElement[] = Array.from(root.querySelectorAll('section[data-id]'))
    sections.forEach((el, idx) => {
      const show = idx === index
      el.style.display = show ? '' : 'none'
      el.setAttribute('aria-hidden', show ? 'false' : 'true')
    })
    const id = sections[index]?.dataset.id
    if (id) {
      const url = new URL(window.location.href)
      url.hash = id
      window.history.replaceState({}, '', url.toString())
    }
    // Sempre rolar para o topo ao trocar de slide (evita ficar "no meio" após navegação)
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      window.scrollTo(0, 0)
    }
  }, [index, mode])

  // Custom three-finger horizontal swipe detection
  useEffect(() => {
    if (mode !== 'apresentacao') return
    const el = containerRef.current?.parentElement // wrapper div inside deck
    if (!el) return

    let startX = 0
    let startY = 0
    let active = false
    let moved = false

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 3) {
        const t = e.touches[0]
        startX = t.clientX
        startY = t.clientY
        active = true
        moved = false
      } else {
        active = false
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (!active) return
      if (e.touches.length !== 3) { active = false; return }
      const t = e.touches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      // ignore mostly vertical
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        moved = true
      }
    }
    function onTouchEnd(e: TouchEvent) {
      if (!active) return
      // After fingers lifted, decide navigation based on final delta
      if (moved) {
        const dx = (e.changedTouches[0]?.clientX || 0) - startX
        if (dx < -30) {
          setIndex(i => Math.min(i + 1, Math.max(0, ids.length - 1)))
        } else if (dx > 30) {
          setIndex(i => Math.max(i - 1, 0))
        }
      }
      active = false
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [mode, ids.length])

  if (mode !== 'apresentacao') {
    // fluxo linear
    return <div ref={containerRef}>{children}</div>
  }

  return (
    <div className="presentation-deck relative mx-auto w-full">
      {/* Barra fixa de controles no topo */}
      <div
        className="sticky top-0 z-20 w-full border-b bg-[var(--bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/70 flex items-stretch gap-3 px-2 sm:px-3 h-6"
      >
        <div className="flex-1 min-w-0 h-full flex items-center">
          <div className="font-semibold text-sm sm:text-base md:text-lg truncate leading-none" title={title}>{title}</div>
        </div>
        <div className="flex items-stretch gap-2 h-full">

          <ButtonIconOnly
            ariaLabel="Slide anterior"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          >
            <ArrowLeft />
          </ButtonIconOnly>

          <div className="flex h-full items-center justify-center text-[10px] sm:text-xs font-medium opacity-70 tabular-nums w-14 leading-none select-none">
            {ids.length ? index + 1 : 0}/{ids.length || 0}
          </div>

          <ButtonIconOnly
            ariaLabel="Próximo slide"
            onClick={() => setIndex((i) => Math.min(i + 1, Math.max(0, ids.length - 1)))}
          >
            <ArrowRight />
          </ButtonIconOnly>

        </div>
      </div>

      {/* Conteúdo; padding-top reduzido para aproximar do header */}
  <div ref={containerRef} className="pt-1" suppressHydrationWarning>
        {children}
      </div>
    </div>
  )
}