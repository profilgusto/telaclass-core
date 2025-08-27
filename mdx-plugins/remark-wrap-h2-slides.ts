// remark-wrap-h2-slides.ts
// Split the top-level flow into <Slide data-id="..."> segments:
// 1. Intro segment: any nodes before the first level-2 heading (h2)
// 2. Each h2 + following nodes until the next h2
// Produces mdxJsxFlowElement nodes named "Slide" so runtime Slide component
// can control styling (only in presentation mode) and SlideDeck can paginate.
import type { Plugin } from 'unified'
import { toString } from 'mdast-util-to-string'

type Node = any
type Parent = { type: string; children: Node[] }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'slide'
}

const remarkWrapH2Slides: Plugin = () => {
  return (tree: Node) => {
    if (!tree || tree.type !== 'root') return
    const root = tree as Parent
    const kids = root.children || []
    if (!kids.length) return

    // Quick scan: does it even have an h2? If not, do nothing (single flow).
    const hasH2 = kids.some(n => n.type === 'heading' && n.depth === 2)
    if (!hasH2) return

    // Build segments
    const segments: Node[][] = []
    let current: Node[] = []
    const push = () => { if (current.length) { segments.push(current); current = [] } }

    function isSlideBreak(n: Node): boolean {
      // Our custom delimiter: paragraph whose plain text is exactly '---sldbrk'
      if (n.type === 'paragraph' && Array.isArray(n.children) && n.children.length === 1) {
        const c = n.children[0]
        if (c.type === 'text' && c.value && c.value.trim() === '---sldbrk') return true
      }
      return false
    }

    for (const n of kids) {
      if ((n.type === 'heading' && n.depth === 2) || isSlideBreak(n)) {
        // finalize previous
        push()
        if (isSlideBreak(n)) {
          // explicit break marker is discarded (not included in any segment)
          continue
        }
        current.push(n)
      } else {
        current.push(n)
      }
    }
    push()

    // Generate mdxJsxFlowElement nodes
    const out: Node[] = []
    const used = new Set<string>()
    segments.forEach((seg, idx) => {
      let heading = seg.find(n => n.type === 'heading' && (n.depth === 2 || n.depth === 1))
      let text = heading ? toString(heading).trim() : (idx === 0 ? 'introducao' : `slide-${idx+1}`)
      let base = slugify(text) || `slide-${idx+1}`
      let id = base
      let counter = 2
      while (used.has(id)) { id = `${base}-${counter++}` }
      used.add(id)
      out.push({
        type: 'mdxJsxFlowElement',
        name: 'Slide',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'data-id', value: id }
        ],
        children: seg,
      })
    })

    root.children = out
  }
}

export default remarkWrapH2Slides
