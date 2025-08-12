// app/mdx-components.tsx
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p) => <h1 className="text-3xl font-bold mt-8 mb-4" {...p} />,
    h2: (p) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...p} />,
    p:  (p) => <p className="leading-7 my-4" {...p} />,
    ul: (p) => <ul className="list-disc ms-6 my-4" {...p} />,
    ol: (p) => <ol className="list-decimal ms-6 my-4" {...p} />,
    a:  (p) => <a className="underline" {...p} />,
    ...components,
  };
}