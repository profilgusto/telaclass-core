// mdx-plugins/rehype-wrap-h2-sections.ts
import type { Plugin } from 'unified'
import { toString } from 'hast-util-to-string'
import { h } from 'hastscript'

type Node = any
type Parent = any

// Reagrupa o fluxo em <Slide data-id="...">:
// - Tudo ANTES do primeiro h2 vira slide de introdução (usa id do h1 se houver)
// - Cada h2 inicia novo slide até o próximo h2
// Isso elimina a necessidade de "DOM surgery" em runtime.
const rehypeWrapH2Sections: Plugin = () => {
  return (tree: Node) => {
    const root = tree as Parent
    const kids: Node[] = Array.isArray(root.children) ? root.children.slice() : []
    if (!kids.length) return

    const slides: Node[][] = []
    let current: Node[] = []

    const pushCurrent = () => {
      if (current.length) {
        slides.push(current)
        current = []
      }
    }

    for (let i = 0; i < kids.length; i++) {
      const n = kids[i]
      if (n.type === 'element' && n.tagName === 'h2') {
        // fecha o segmento anterior e começa com o h2
        pushCurrent()
        current.push(n)
      } else {
        current.push(n)
      }
    }
    pushCurrent()

    // Se não há h2, não mexe (assim texto simples permanece como antes).
    const hasH2 = slides.some(seg => seg.some(n => n.type === 'element' && n.tagName === 'h2'))
    if (!hasH2) return

    const out: Node[] = []
    slides.forEach((seg, idx) => {
      // Encontrar heading primário para gerar id
      let heading = seg.find(n => n.type === 'element' && (n.tagName === 'h2' || n.tagName === 'h1'))
      // Se segmento inicial não tem h2 mas tem h1: id do h1; senão fallback
      let id = heading && heading.properties && heading.properties.id as string
      if (!id) {
        const text = heading ? toString(heading) : 'introducao'
        id = text
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '') || `slide-${idx+1}`
      }
      out.push(h('Slide', { 'data-id': id }, seg as any))
    })

    root.children = out
  }
}

export default rehypeWrapH2Sections