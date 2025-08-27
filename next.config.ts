// next.config.ts
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

// Plugins para matemática em MDX
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeMathjax from 'rehype-mathjax'; // alias para a variante SVG
import remarkDirective from 'remark-directive'
// Reuse local plugin definitions instead of inlining to keep pipeline simple
import remarkDirectiveToMdx from './mdx-plugins/remark-directive-to-mdx'
import rehypeSlug from 'rehype-slug'
// (Old rehypeWrapH2Sections no longer used; segmentation now done at remark stage)
import remarkWrapH2Slides from './mdx-plugins/remark-wrap-h2-slides'

// IMPORTS IMPORTANTES: usar caminhos relativos (não alias @/) porque next.config
// é avaliado pelo Node antes do pipeline de resolução de paths do TS.
// Para evitar falha de resolução em runtime dentro do container (next start avalia
// next.config.ts já transpilado), inlinamos os plugins leves usados.
import type { Plugin } from 'unified';

// (Removed inline remarkDirectiveToMdx; imported above)

// (Removed inline rehypeWrapH2Sections; using imported version)

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Habilita $...$ (inline) e $$...$$ (display)
  remarkPlugins: [remarkMath, remarkDirective, remarkGfm, remarkDirectiveToMdx, remarkWrapH2Slides],
    // Renderiza com MathJax no build (SSR) e numerações automáticas
    // IMPORTANTE: cada plugin como entrada separada; antes rehypeSlug/WrapH2 eram passados como args extras de rehypeMathjax e não executavam.
    rehypePlugins: [
      [
        rehypeMathjax,
        {
          tex: {
            tags: 'all',
            useLabelIds: true,
          },
        },
      ],
  rehypeSlug,
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
