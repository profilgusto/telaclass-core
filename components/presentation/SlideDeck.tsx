'use client'

import { useEffect, useRef, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { useViewMode } from './useViewMode'

import { ArrowLeft, ArrowRight } from 'lucide-react';

type Range = { start: number; end: number; id: string }
type Cleanup = () => void

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function SlideDeck({ children }: { children: React.ReactNode }) {
  const mode = useViewMode()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [index, setIndex] = useState(0)
  const [ids, setIds] = useState<string[]>([])
  const [title, setTitle] = useState('')

  // capturar título (H1) inicial / sempre que children mudar
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const h1 = root.querySelector('h1')
    if (h1) setTitle(h1.textContent?.trim() || '')
  }, [children])

  // cria/usa sections como “unidade de slide”
  useEffect(() => {
    if (mode !== 'apresentacao') return
    const root = containerRef.current
    if (!root) return

    const cleanups: Cleanup[] = []

    // 1) Se já existem <section data-id>, usamos eles (pipeline com plugin)
    let sections: HTMLElement[] = Array.from(root.querySelectorAll<HTMLElement>('section[data-id]'))
    if (sections.length === 0) {
      // 2) FALLBACK: agrupar por <h2> dentro do .prose → embrulhar cada trecho em <section data-id=...>
      const prose = root.querySelector<HTMLElement>('div.prose') ?? root
      const kids = Array.from(prose.children) as HTMLElement[]

      const h2s = kids.map((el, i) => ({ el, i })).filter(({ el }) => el.tagName === 'H2')
      if (h2s.length === 0) {
        setIds([])
        return
      }

      const built: Range[] = []

      // INTRO: tudo antes do primeiro H2 vira primeiro slide
      if (h2s[0].i > 0) {
        const introStart = 0
        const introEnd = h2s[0].i - 1
        // tenta achar um H1 para gerar id consistente
        const h1 = kids.slice(introStart, introEnd + 1).find(n => n.tagName === 'H1')
        let introId = h1?.getAttribute('id') || ''
        if (!introId) {
          introId = slugify(h1?.textContent || 'introducao') || 'intro'
          if (h1) h1.setAttribute('id', introId)
        }
        built.push({ start: introStart, end: introEnd, id: introId })
      }

      // Demais slides a partir de cada H2
      for (let j = 0; j < h2s.length; j++) {
        const start = h2s[j].i
        const end = j < h2s.length - 1 ? h2s[j + 1].i - 1 : kids.length - 1
        const h2 = h2s[j].el
        let id = h2.getAttribute('id') || ''
        if (!id) {
          id = slugify(h2.textContent || '')
          h2.setAttribute('id', id)
        }
        built.push({ start, end, id })
      }

      // embrulhar ranges em sections (movendo os nós DOM)
      const newSections: HTMLElement[] = []
      built.forEach((r, idx) => {
        const sec = document.createElement('section')
        sec.dataset.id = r.id
        sec.className = 'rounded-2xl px-6 py-8 mx-auto my-8 max-w-4xl'
        for (let i = r.start; i <= r.end; i++) {
          if (kids[i]?.parentElement === prose) {
            sec.appendChild(kids[i])
          }
        }
        // Estilização especial para o primeiro slide (intro com H1)
        if (idx === 0) {
          const h1 = sec.querySelector('h1') as HTMLElement | null
          if (h1) {
            if (!title) setTitle(h1.textContent?.trim() || '')
            // classes grandes e centralizadas
            h1.classList.add('text-5xl','sm:text-6xl','font-bold','text-center','mb-6')
            // agrupar restante como subtítulo centralizado
            const rest = Array.from(sec.childNodes).filter(n => n !== h1)
            if (rest.length) {
              const wrapper = document.createElement('div')
              wrapper.className = 'mt-2 text-xl text-center leading-relaxed space-y-4 max-w-3xl'
              rest.forEach(n => wrapper.appendChild(n))
              sec.appendChild(wrapper)
            }
            sec.classList.add('intro-slide','flex','flex-col','items-center','justify-center','min-h-[60vh]','text-center')
          }
        }
        prose.insertBefore(sec, prose.children[r.start] || null)
        newSections.push(sec)
      })

      cleanups.push(() => {
        newSections.forEach((sec) => {
          while (sec.firstChild) {
            prose.insertBefore(sec.firstChild, sec)
          }
          sec.remove()
        })
      })

      sections = newSections
    }

    // estado inicial + visibilidade
    const apply = (i: number) => {
      sections.forEach((el, idx) => {
        const show = idx === i
        el.style.display = show ? '' : 'none'
        el.setAttribute('aria-hidden', show ? 'false' : 'true')
      })
      const id = sections[i]?.dataset.id
      if (id) {
        const url = new URL(window.location.href)
        url.hash = id
        window.history.replaceState({}, '', url.toString())
      }
    }

    const hash = window.location.hash.replace(/^#/, '')
    const initial = hash ? Math.max(0, sections.findIndex((el) => el.dataset.id === hash)) : 0
    const startIndex = initial >= 0 ? initial : 0

    setIds(sections.map((s) => s.dataset.id || '').filter(Boolean))
    setIndex(startIndex)
    apply(startIndex)

    // teclado
    const onKey = (e: KeyboardEvent) => {
      const max = Math.max(0, sections.length - 1)
      if (['ArrowRight','PageDown'].includes(e.key)) setIndex((i) => Math.min(i + 1, max))
      if (['ArrowLeft','PageUp'].includes(e.key)) setIndex((i) => Math.max(i - 1, 0))
      if (e.key === 'Home') setIndex(0)
      if (e.key === 'End') setIndex(Math.max(0, max))
    }
    window.addEventListener('keydown', onKey)
    cleanups.push(() => window.removeEventListener('keydown', onKey))

    // cleanup geral: mostrar tudo (e desfazer wrappers criados)
    return () => {
      sections.forEach((el) => {
        el.style.display = ''
        el.removeAttribute('aria-hidden')
      })
      cleanups.forEach((fn) => fn())
    }
  }, [mode, children])

  // aplica visibilidade sempre que o índice mudar
  useEffect(() => {
    if (mode !== 'apresentacao') return
    const root = containerRef.current
    if (!root) return

    // preferir sections[data-id] (pipeline ou fallback já criou)
    const sections: HTMLElement[] = Array.from(root.querySelectorAll<HTMLElement>('section[data-id]'))
    if (sections.length === 0) return

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
  }, [index, mode])

  // swipe
  const bind = useSwipeable({
    onSwipedLeft: () => setIndex((i) => Math.min(i + 1, Math.max(0, ids.length - 1))),
    onSwipedRight: () => setIndex((i) => Math.max(i - 1, 0)),
    trackMouse: true,
  })

  if (mode !== 'apresentacao') {
    // fluxo linear
    return <div ref={containerRef}>{children}</div>
  }

  return (
    <div className="relative mx-auto w-full" {...bind}>
      {/* Barra fixa de controles no topo */}
      <div
        className="sticky top-0 z-20 w-full border-b bg-[var(--bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/70 flex items-stretch gap-3 px-3 h-6"
      >
        <div className="flex-1 min-w-0 h-full flex items-center">
          <div className="font-semibold text-sm sm:text-base md:text-lg truncate leading-none" title={title}>{title}</div>
        </div>
        <div className="flex items-stretch gap-2 h-full">
          <button
            className="flex h-full w-7 items-center justify-center rounded-md border text-[10px] sm:text-xs disabled:opacity-50 leading-none p-0"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index <= 0 || ids.length === 0}
            aria-label="Slide anterior"
          >
            <ArrowLeft className="h-12 w-12" />
          </button>
          <div className="flex h-full items-center justify-center text-[10px] sm:text-xs font-medium opacity-70 tabular-nums w-14 leading-none select-none">
            {ids.length ? index + 1 : 0}/{ids.length || 0}
          </div>
          <button
            className="flex h-full w-7 items-center justify-center rounded-md border text-[10px] sm:text-xs disabled:opacity-50 leading-none p-0"
            onClick={() => setIndex((i) => Math.min(i + 1, Math.max(0, ids.length - 1)))}
            disabled={index >= ids.length - 1 || ids.length === 0}
            aria-label="Próximo slide"
          >
            <ArrowRight className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* Conteúdo; padding-top para não ficar escondido sob a barra (caso não role) */}
      <div ref={containerRef} className="pt-4">
        {children}
      </div>
    </div>
  )
}