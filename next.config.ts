// next.config.ts
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

// Plugins para matemática em MDX
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax'; // alias para a variante SVG
import remarkDirective from 'remark-directive'
import rehypeSlug from 'rehype-slug'

// IMPORTS IMPORTANTES: usar caminhos relativos (não alias @/) porque next.config
// é avaliado pelo Node antes do pipeline de resolução de paths do TS.
// Para evitar falha de resolução em runtime dentro do container (next start avalia
// next.config.ts já transpilado), inlinamos os plugins leves usados.
import type { Plugin } from 'unified';

// Inline remarkDirectiveToMdx (subset usado)
const remarkDirectiveToMdx: Plugin = () => {
  return (tree: any) => {
    const visit = require('unist-util-visit').visit as any;
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective' && (node.name === 'present-only' || node.name === 'text-only')) {
        const name = node.name === 'present-only' ? 'PresentOnly' : 'TextOnly';
        const data = node.data || (node.data = {});
        data.hName = 'mdxJsxFlowElement';
        data.hProperties = { name };
      }
    });
  };
};

// Inline rehypeWrapH2Sections
const rehypeWrapH2Sections: Plugin = () => {
  return (tree: any) => {
    const visit = require('unist-util-visit').visit as any; // not strictly needed but keep parity
    const toString = require('hast-util-to-string').toString as any;
    const h = require('hastscript').h as any;
    const root: any = tree;
    const children: any[] = root.children || [];
    const newChildren: any[] = [];
    let i = 0;
    while (i < children.length) {
      const node = children[i];
      if (node.type === 'element' && node.tagName === 'h2') {
        const slideNodes: any[] = [node];
        i++;
        while (i < children.length && !(children[i].type === 'element' && children[i].tagName === 'h2')) {
          slideNodes.push(children[i]);
          i++;
        }
        let id = (node.properties && node.properties.id) || toString(node).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        const slide = h('Slide', { 'data-id': id }, slideNodes as any[]);
        newChildren.push(slide);
      } else {
        newChildren.push(node);
        i++;
      }
    }
    root.children = newChildren;
  };
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Habilita $...$ (inline) e $$...$$ (display)
    remarkPlugins: [remarkMath, remarkDirective, remarkDirectiveToMdx],
    // Renderiza com MathJax no build (SSR) e numerações automáticas
    rehypePlugins: [
      [
        rehypeMathjax,
        {
          // Opções do MathJax TeX input:
          // 'all' => numera TODO display-math (inclui $$...$$)
          // 'ams' => segue as regras AMS (numera só certos ambientes)
          tex: {
            tags: 'all',
            useLabelIds: true, // IDs de elemento baseados no \label
            // tagSide: 'right', // mude para 'left' se quiser números à esquerda
          },
          // Para SVG você normalmente não precisa configurar nada aqui.
          // Se preferir CommonHTML (CHTML), use a alternativa no bloco abaixo.
        },
        rehypeSlug,
        rehypeWrapH2Sections,
      ],
    ],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
    // Permite deployment mesmo com avisos/erros de lint (tratados depois no CI)
    ignoreDuringBuilds: true,
  },
};

export default withMDX(nextConfig);

/* --- Alternativa CHTML (opcional, se quiser trocar para CHTML) ---
import rehypeMathjaxChtml from 'rehype-mathjax/chtml';
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeMathjaxChtml,
        {
          tex: { tags: 'all', useLabelIds: true },
          chtml: {
            // obrigatório para CHTML: URL das fontes WOFF v2 do MathJax
            fontURL:
              'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
          },
        },
      ],
    ],
  },
});
------------------------------------------------------------------ */