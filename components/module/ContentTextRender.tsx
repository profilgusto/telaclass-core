"use client"
import { Course } from '@/lib/content'
import { CourseSidebar } from '@/components/course-sidebar'
import { ModuleContentCore } from './ModuleContentCore'
import { useEffect, useState, useRef } from 'react'
import GithubSlugger from 'github-slugger'

interface Props {
  course: Course
  slug: string
  mod: string
  manifestKey: string
  headings: Array<{ id: string; text: string }>
  active: boolean
}

export function ContentTextRender({ course, slug, mod, manifestKey, headings, active }: Props) {
  const [currentHeadingId, setCurrentHeadingId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  // Smooth scroll when hash changes (while component mounted)
  useEffect(() => {
    if (!active) return
  const HEADER_OFFSET = 64

    const ensureIds = () => {
      try {
        const container = document.querySelector('main .prose')
        if (container) {
          const slugger = new GithubSlugger()
            ; (Array.from(container.querySelectorAll('h2')) as HTMLElement[]).forEach(h2 => {
              if (!h2.id) {
                const text = h2.textContent?.trim() || ''
                if (text) h2.id = slugger.slug(text)
              }
            })
        }
      } catch { }
    }

    const smoothScrollTo = (id: string, attempt = 0) => {
      if (!id) return
      ensureIds()
      const el = document.getElementById(id)
      if (!el) {
        if (attempt < 30) {
          // retry ~30 * 50ms = 1.5s while MDX loads
          setTimeout(() => smoothScrollTo(id, attempt + 1), 50)
        }
        return
      }
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
    }

    const handleHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (id) smoothScrollTo(id)
    }

    // initial hash (after delay for async MDX)
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [active, manifestKey, slug, mod])

  // Scroll spy using IntersectionObserver
  useEffect(() => {
    if (!active) return
    const container = document.querySelector('main .prose') || document.querySelector('main')
    if (!container) return
    const headingEls = Array.from(container.querySelectorAll('h2')) as HTMLElement[]
    if (!headingEls.length) return
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  const HEADER_OFFSET = 64
    const opts: IntersectionObserverInit = {
      root: null,
      rootMargin: `-${HEADER_OFFSET + 8}px 0px -70% 0px`,
      threshold: [0, 1.0]
    }
    const visible = new Map<string, number>()
    let debounceTimer: number | null = null
    const schedule = (fn: () => void) => {
      if (debounceTimer) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(fn, 50) // 50ms debounce
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const id = (e.target as HTMLElement).id
        if (!id) return
        if (e.isIntersecting) {
          visible.set(id, e.intersectionRatio)
        } else {
          visible.delete(id)
        }
      })
      schedule(() => {
        if (visible.size) {
          const ordered = headingEls.filter(h => visible.has(h.id))
          if (ordered.length) {
            setCurrentHeadingId(prev => prev === ordered[0].id ? prev : ordered[0].id)
            return
          }
        }
        // fallback: find last heading passed
        let last: string | null = null
        for (const h of headingEls) {
          const rect = h.getBoundingClientRect()
          if (rect.top < HEADER_OFFSET + 4) last = h.id
          else break
        }
        if (last) setCurrentHeadingId(prev => prev === last ? prev : last)
      })
    }, opts)
    headingEls.forEach(h => io.observe(h))
    observerRef.current = io
    return () => { io.disconnect(); if (debounceTimer) window.clearTimeout(debounceTimer) }
  }, [active, headings, manifestKey])

  // Persist current heading hash without triggering hashchange (smooth scroll only on explicit user navigation)
  useEffect(() => {
    if (!active || !currentHeadingId) return
    try {
      const current = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (current === currentHeadingId) return
      const url = new URL(window.location.href)
      url.hash = currentHeadingId
      window.history.replaceState({}, '', url)
    } catch {}
  }, [currentHeadingId, active])

  return (
    <div className={['flex min-h-screen', active ? '' : 'hidden'].join(' ')}>
      <aside className="hidden md:block w-60 shrink-0 border-r border-border bg-[var(--sidebar)] text-[var(--sidebar-foreground)] sticky top-14 h-[calc(100vh-56px)]">
        <CourseSidebar course={course} slug={slug} currentModulePath={mod} headings={headings} currentHeadingId={currentHeadingId} />
      </aside>
      <main className="flex-1 px-[var(--space-lg)] py-[var(--space-md)]">
        <ModuleContentCore manifestKey={manifestKey} slug={slug} mod={mod} mode="texto" />
      </main>
    </div>
  )
}
