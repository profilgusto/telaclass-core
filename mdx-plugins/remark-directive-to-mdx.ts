// mdx-plugins/remark-directive-to-mdx.ts
import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Parent } from 'unist'

type Node = any

// Transforma "containerDirective" de remark-directive em mdxJsxFlowElement
const remarkDirectiveToMdx: Plugin = () => {
  return (tree: Node) => {
    visit(tree, (node: Node) => {
      if (
        node.type === 'containerDirective' &&
        (node.name === 'present-only' || node.name === 'text-only')
      ) {
        const name = node.name === 'present-only' ? 'PresentOnly' : 'TextOnly'
        const data = node.data || (node.data = {})
        data.hName = 'mdxJsxFlowElement'
        data.hProperties = { name }
      }
    })
  }
}

export default remarkDirectiveToMdx