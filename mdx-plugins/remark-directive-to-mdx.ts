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
      'to': 'TextOnly',
      'youtube': 'YouTube',
      'yt': 'YouTube'
    }

    // 1) Proper container directives :::present-only / :::text-only / :::po / :::to
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective' && nameMap[node.name]) {
        const comp = nameMap[node.name]
        if (comp === 'YouTube') {
          // Extract first URL-like text from its children (simple heuristic)
          let url: string | null = null
          const textNodes: any[] = []
          const collectText = (n: any) => {
            if (!n) return
            if (n.type === 'text' && typeof n.value === 'string') textNodes.push(n.value)
            if (Array.isArray(n.children)) n.children.forEach(collectText)
          }
          node.children?.forEach(collectText)
          const joined = textNodes.join(' ').trim()
          const match = joined.match(/https?:\/\/[\w./?=&%-]+/i)
          if (match) url = match[0]
          // Fallback: url attribute in directive syntax: :::youtube{url="..."}
          if (!url && node.attributes && typeof node.attributes.url === 'string') url = node.attributes.url
          if (url) {
            node.attributes = [
              { type: 'mdxJsxAttribute', name: 'url', value: url }
            ]
            // Remove children so it renders only the component
            node.children = []
          }
        }
        toMdxJsx(node, comp)
      }
    })

  }
}

export default remarkDirectiveToMdx