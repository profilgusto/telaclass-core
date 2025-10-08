// remark-wrap-h2-slides.ts
// (Agora também quebra em h3 e h4)
// Split the top-level flow into <Slide data-id="..."> segments:
// 1. Intro segment: any nodes before the first level-2/3 heading (h2/h3)
// 2. Each h2 OR h3 + following nodes until the next h2/h3 (or explicit marker)
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

  // Quick scan: does it even have an h2, h3 or h4? If not, do nothing (single flow).
  const hasBreakHeading = kids.some(n => n.type === 'heading' && (n.depth === 2 || n.depth === 3 || n.depth === 4))
  if (!hasBreakHeading) return

    // Build segments
    const segments: Node[][] = []
    let current: Node[] = []
    let currentLayout = '1' // Default layout
    const segmentLayouts: string[] = [] // Track layout for each segment
    const push = () => { 
      if (current.length) { 
        segments.push(current)
        segmentLayouts.push(currentLayout)
        current = [] 
      } 
    }

    function isSlideBreak(n: Node): boolean {
      // Our custom delimiter: paragraph whose plain text is exactly '---sldbrk'
      if (n.type === 'paragraph' && Array.isArray(n.children) && n.children.length === 1) {
        const c = n.children[0]
        if (c.type === 'text' && c.value && c.value.trim() === '---sldbrk') return true
      }
      return false
    }

    function isLayoutCommand(n: Node): { isLayout: boolean; layout?: string } {
      // Detect layout commands: paragraph whose plain text is exactly '---sldlayout1', '---sldlayout2', etc.
      if (n.type === 'paragraph' && Array.isArray(n.children) && n.children.length === 1) {
        const c = n.children[0]
        if (c.type === 'text' && c.value) {
          const trimmed = c.value.trim()
          const match = trimmed.match(/^---sldlayout(\d+)$/)
          if (match) {
            return { isLayout: true, layout: match[1] }
          }
        }
      }
      return { isLayout: false }
    }

    for (const n of kids) {
      const layoutCheck = isLayoutCommand(n)
      
      if (layoutCheck.isLayout) {
        // Layout command: update current layout and discard the command node
        currentLayout = layoutCheck.layout || '1'
        continue
      }
      
      if ((n.type === 'heading' && (n.depth === 2 || n.depth === 3 || n.depth === 4)) || isSlideBreak(n)) {
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
      // Prefer h2, then h1, then h3, then h4 for id generation (so nested subsections get stable ids)
      let heading = seg.find(n => n.type === 'heading' && n.depth === 2)
        || seg.find(n => n.type === 'heading' && n.depth === 1)
        || seg.find(n => n.type === 'heading' && n.depth === 3)
        || seg.find(n => n.type === 'heading' && n.depth === 4)
      let text = heading ? toString(heading).trim() : (idx === 0 ? 'introducao' : `slide-${idx+1}`)
      let base = slugify(text) || `slide-${idx+1}`
      let id = base
      let counter = 2
      while (used.has(id)) { id = `${base}-${counter++}` }
      used.add(id)
      
      const layout = segmentLayouts[idx] || '1'
      
      out.push({
        type: 'mdxJsxFlowElement',
        name: 'Slide',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'data-id', value: id },
          { type: 'mdxJsxAttribute', name: 'data-layout', value: layout }
        ],
        children: seg,
      })
    })

    root.children = out
  }
}

export default remarkWrapH2Slides
