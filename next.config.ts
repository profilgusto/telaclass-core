// next.config.ts
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

// Plugins para matemática em MDX
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax'; // alias para a variante SVG

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Habilita $...$ (inline) e $$...$$ (display)
    remarkPlugins: [remarkMath],
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
      ],
    ],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
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