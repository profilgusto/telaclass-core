// mdx-plugins/rehype-wrap-h2-sections.ts
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import { h } from 'hastscript'

type Node = any
type Parent = any

const rehypeWrapH2Sections: Plugin = () => {
  return (tree: Node) => {
    const root = tree as Parent
    const children: Node[] = root.children || []
    const newChildren: Node[] = []

    let i = 0
    while (i < children.length) {
      const node = children[i]
      if (node.type === 'element' && node.tagName === 'h2') {
        const slideNodes: Node[] = [node]
        i++
        while (
          i < children.length &&
          !(children[i].type === 'element' && children[i].tagName === 'h2')
        ) {
          slideNodes.push(children[i])
          i++
        }
        // id já vem de rehype-slug (se houver), senão gera
        let id =
          (node.properties && (node.properties.id as string)) ||
          toString(node)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
        const slide = h(
          'Slide',
          { 'data-id': id },
          slideNodes as unknown as any[]
        )
        newChildren.push(slide)
      } else {
        newChildren.push(node)
        i++
      }
    }

    root.children = newChildren
  }
}

export default rehypeWrapH2Sections