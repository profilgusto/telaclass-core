'use client'
import { Children, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { AnimatePresence, motion } from 'framer-motion'
import { useViewMode } from './useViewMode'

function isSlide(el: any) {
  return el?.type?.name === 'Slide' || el?.type?.displayName === 'Slide' || el?.type?.toString?.().includes('Slide')
}

export default function SlideDeck({ children }: { children: ReactNode }) {
  const mode = useViewMode()

  // Coleta os slides (filhos que são <Slide />)
  const slides = useMemo(() => {
    const arr = Children.toArray(children) as ReactElement[]
    return arr.filter(isSlide)
  }, [children])

  const [index, setIndex] = useState(0)
  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(i, Math.max(0, slides.length - 1))),
    [slides.length]
  )

  // Atualiza hash com data-id do slide
  useEffect(() => {
    if (mode !== 'apresentacao' || slides.length === 0) return
    const el = slides[index]
    const id = el?.props?.['data-id']
    if (id) {
      const url = new URL(window.location.href)
      url.hash = id
      window.history.replaceState({}, '', url.toString())
    }
  }, [index, slides, mode])

  // Vai ao slide do hash (se existir)
  useEffect(() => {
    if (mode !== 'apresentacao' || slides.length === 0) return
    const fromHash = window.location.hash.replace(/^#/, '')
    if (fromHash) {
      const target = slides.findIndex((s: any) => s.props?.['data-id'] === fromHash)
      if (target >= 0) setIndex(target)
    }
  }, [slides, mode])

  // Teclado
  useEffect(() => {
    if (mode !== 'apresentacao') return
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight','PageDown'].includes(e.key)) setIndex(i => clamp(i + 1))
      if (['ArrowLeft','PageUp'].includes(e.key)) setIndex(i => clamp(i - 1))
      if (e.key === 'Home') setIndex(0)
      if (e.key === 'End') setIndex(slides.length - 1)
      if (e.key === 't') {
        const url = new URL(window.location.href)
        url.searchParams.set('view', 'texto')
        window.history.replaceState({}, '', url.toString())
        location.reload()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clamp, slides.length, mode])

  // Swipe
  const bind = useSwipeable({
    onSwipedLeft: () => setIndex(i => clamp(i + 1)),
    onSwipedRight: () => setIndex(i => clamp(i - 1)),
    trackMouse: true,
  })

  if (mode !== 'apresentacao') {
    // modo texto: render linear (sem carrossel)
    return <>{children}</>
  }

  // modo apresentação: tela “página a página” (altura auto)
  return (
    <div {...bind} className="relative mx-auto w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
        >
          {slides[index]}
        </motion.div>
      </AnimatePresence>

      {/* Controles simples */}
      <div className="mt-4 flex items-center justify-between max-w-4xl mx-auto px-6">
        <button
          className="rounded-xl px-3 py-2 border text-sm"
          onClick={() => setIndex(i => clamp(i - 1))}
          disabled={index === 0}
        >
          ◀︎ Anterior
        </button>

        <div className="text-sm opacity-70">
          {slides.length ? index + 1 : 0}/{slides.length || 0}
        </div>

        <button
          className="rounded-xl px-3 py-2 border text-sm"
          onClick={() => setIndex(i => clamp(i + 1))}
          disabled={index >= slides.length - 1}
        >
          Próximo ▶︎
        </button>
      </div>
    </div>
  )
}