"use client"
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * MathAutoWrap
 * - Envelopa automaticamente todas as equações de display (mjx-container[display="true"]) com
 *   um contêiner de rolagem horizontal discreto (.math-scroll), evitando overflow da página.
 * - Idempotente e resiliente: reprocessa quando o DOM muda (MDX carregado/atualizado).
 */
export default function MathAutoWrap({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const wrapAll = () => {
      const nodes = root.querySelectorAll('mjx-container[display="true"]')
      nodes.forEach(n => {
        const el = n as HTMLElement
        if (el.closest('.math-row')) return

        // Try to get tag text BEFORE moving nodes (sibling tag is often adjacent)
        const originalParent = el.parentElement
        let siblingTag: HTMLElement | null = null
        if (originalParent) {
          const nextEl = el.nextElementSibling as HTMLElement | null
          const prevEl = el.previousElementSibling as HTMLElement | null
          if (nextEl && nextEl.classList.contains('mjx-tag')) siblingTag = nextEl
          else if (prevEl && prevEl.classList.contains('mjx-tag')) siblingTag = prevEl
        }
        let tagText: string | null = null
        // sometimes inside the container (rare)
        const innerTag = el.querySelector('.mjx-tag') as HTMLElement | null
        if (innerTag) tagText = (innerTag.textContent || '').trim()
        if (!tagText && siblingTag) tagText = (siblingTag.textContent || '').trim()

        // Create layout: [ scrollable equation | sticky tag ]
        const row = document.createElement('div')
        row.className = 'math-row'
        const scroll = document.createElement('div')
        scroll.className = 'math-scroll'
        const tagBox = document.createElement('div')
        tagBox.className = 'math-tag'

        // Insert row before element and move the container inside scroll
        el.parentNode?.insertBefore(row, el)
        row.appendChild(scroll)
        scroll.appendChild(el)

        if (tagText) {
          const span = document.createElement('span')
          span.className = 'math-tag-text'
          span.textContent = tagText
          tagBox.appendChild(span)
        }
        // Hide sibling original tag if we found one
        if (siblingTag) siblingTag.style.display = 'none'
        row.appendChild(tagBox)
      })
    }

    // initial pass
    wrapAll()
    // observe DOM mutations as MDX loads async
    const mo = new MutationObserver(() => wrapAll())
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}
