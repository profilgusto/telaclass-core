// next.config.ts
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // Se você tiver remark/rehype, coloque em `options`:
  // options: { remarkPlugins: [], rehypePlugins: [] },
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
};

export default withMDX(nextConfig);