// mdx-plugins/rehype-wrap-h2-sections.ts
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import { h } from 'hastscript'

type Node = any
type Parent = any

const rehypeWrapH2Sections: Plugin = () => {
  return (tree: any) => {
    const root = tree as any
    const children: any[] = root.children || []
    const newChildren: any[] = []

    // 1) Intro: tudo antes do primeiro h2 vira um slide próprio
    const firstH2 = children.findIndex(
      n => n.type === 'element' && n.tagName === 'h2'
    )
    let i = 0
    if (firstH2 > 0) {
      const introNodes = children.slice(0, firstH2)
      // gerar id: preferir h1 dentro; senão primeiro texto; fallback 'intro'
      const h1 = introNodes.find(
        n => n.type === 'element' && n.tagName === 'h1'
      )
      let id =
        (h1?.properties?.id as string) ||
        toString(h1 || introNodes[0] || '') ||
        'intro'
      id =
        id
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '') || 'intro'
      newChildren.push(h('Slide', { 'data-id': id }, introNodes as any))
      i = firstH2 // começar processamento dos h2 a partir daqui
    }

    // 2) Processar cada h2 em diante como antes
    while (i < children.length) {
      const node = children[i]
      if (node.type === 'element' && node.tagName === 'h2') {
        const slideNodes: any[] = [node]
        i++
        while (
          i < children.length &&
          !(children[i].type === 'element' && children[i].tagName === 'h2')
        ) {
          slideNodes.push(children[i])
          i++
        }
        let id =
          (node.properties && (node.properties.id as string)) ||
          toString(node)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
        newChildren.push(h('Slide', { 'data-id': id }, slideNodes as any))
      } else {
        // Se não for h2 (ex: não havia h2 algum), apenas empurrar
        newChildren.push(node)
        i++
      }
    }

    root.children = newChildren
  }
}

export default rehypeWrapH2Sections