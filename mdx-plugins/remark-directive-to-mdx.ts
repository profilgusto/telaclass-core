// mdx-plugins/remark-directive-to-mdx.ts
import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'

type Node = any

// Helper: convert a node (containerDirective) into mdxJsxFlowElement
function toMdxJsx(node: any, componentName: string) {
  node.type = 'mdxJsxFlowElement'
  node.name = componentName
  // Unified expects attributes array; ensure children preserved
  node.attributes = node.attributes || []
  return node
}

const remarkDirectiveToMdx: Plugin = () => {
  return (tree: Node) => {
    // 1) Proper container directives :::present-only / :::text-only
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective' && (node.name === 'present-only' || node.name === 'text-only')) {
        const comp = node.name === 'present-only' ? 'PresentOnly' : 'TextOnly'
        toMdxJsx(node, comp)
      }
    })

    // 2) Fallback: user wrote with two colons ::present-only ... ::
    // remark-directive will NOT parse those, so they remain as normal paragraphs / text.
    // We do a lightweight pass to detect a paragraph that is exactly the opening marker,
    // collect subsequent siblings until a closing marker paragraph '::', wrap them.
    if (Array.isArray(tree.children)) {
      const out: any[] = []
      const kids = tree.children as any[]
      for (let i = 0; i < kids.length; i++) {
        const n = kids[i]
        const isMarkerPara = (k: any) => k && k.type === 'paragraph' && k.children && k.children.length === 1 && k.children[0].type === 'text'
        const textValue = (k: any) => (isMarkerPara(k) ? (k.children[0].value || '').trim() : '')
        const val = textValue(n)
        if (val === '::present-only' || val === '::text-only') {
          const comp = val === '::present-only' ? 'PresentOnly' : 'TextOnly'
          const collected: any[] = []
            ;(i++)
          while (i < kids.length && textValue(kids[i]) !== '::') {
            collected.push(kids[i])
            i++
          }
          // skip closing '::' paragraph if present
          if (i < kids.length && textValue(kids[i]) === '::') {
            // nothing extra
          } else {
            // if no explicit closing, rewind one step so outer loop processes current
            if (i < kids.length) i--
          }
          out.push({ type: 'mdxJsxFlowElement', name: comp, attributes: [], children: collected })
          continue
        }
        out.push(n)
      }
      tree.children = out
    }
  }
}

export default remarkDirectiveToMdx