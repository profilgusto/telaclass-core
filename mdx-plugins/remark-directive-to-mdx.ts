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
    const nameMap: Record<string,string> = {
      'present-only': 'PresentOnly',
      'po': 'PresentOnly',
      'text-only': 'TextOnly',
      'to': 'TextOnly'
    }

    // 1) Proper container directives :::present-only / :::text-only / :::po / :::to
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective' && nameMap[node.name]) {
        const comp = nameMap[node.name]
        toMdxJsx(node, comp)
      }
    })

  }
}

export default remarkDirectiveToMdx