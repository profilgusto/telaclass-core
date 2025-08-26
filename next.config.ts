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
import rehypeWrapH2Sections from './mdx-plugins/rehype-wrap-h2-sections'

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
  remarkPlugins: [remarkMath, remarkDirective, remarkGfm, remarkDirectiveToMdx],
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
