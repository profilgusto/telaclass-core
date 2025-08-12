// app/mdx-components.tsx
import * as React from 'react';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';

// Helper: external link?
const isExternal = (href?: string) =>
  !!href && /^(https?:)?\/\//i.test(href) && !href.startsWith(process.env.NEXT_PUBLIC_SITE_URL ?? '__not_set__');

// Inline vs block code rendering
function Code(props: ComponentPropsWithoutRef<'code'>) {
  const className = props.className ?? '';
  const isBlock = /language-/.test(className);
  if (isBlock) {
    return (
      <code
        {...props}
        className={['block rounded-md p-4 text-sm overflow-x-auto', className].join(' ').trim()}
      />
    );
  }
  return <code {...props} className={['px-1 py-0.5 rounded', className].join(' ').trim()} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: (p) => <h1 className="text-3xl font-bold mt-8 mb-4" {...p} />,
    h2: (p) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...p} />,
    h3: (p) => <h3 className="text-xl font-semibold mt-4 mb-2" {...p} />,

    // Text
    p: (p) => <p className="leading-7 my-4" {...p} />,
    strong: (p) => <strong className="font-semibold" {...p} />,
    em: (p) => <em className="italic" {...p} />,

    // Lists
    ul: (p) => <ul className="list-disc ms-6 my-4" {...p} />,
    ol: (p) => <ol className="list-decimal ms-6 my-4" {...p} />,
    li: (p) => <li className="my-1" {...p} />,

    // Links: open external in new tab, internal via Next/Link
    a: ({ href, children, ...rest }) => {
      const url = typeof href === 'string' ? href : undefined;
      if (!url) return <a {...rest}>{children}</a>;
      if (isExternal(url)) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline" {...rest}>
            {children}
          </a>
        );
      }
      return (
        <Link href={url} className="underline" {...(rest as any)}>
          {children}
        </Link>
      );
    },

    // Code & pre
    code: Code,
    pre: (p) => (
      <pre
        className={['rounded-md p-0 my-4 overflow-x-auto', p.className ?? ''].join(' ').trim()}
        {...p}
      />
    ),

    // Tables
    table: (p) => (
      <div className="my-6 w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm" {...p} />
      </div>
    ),
    th: (p) => <th className="border px-3 py-2 text-left font-semibold" {...p} />,
    td: (p) => <td className="border px-3 py-2 align-top" {...p} />,

    // Blockquote / hr
    blockquote: (p) => <blockquote className="border-l-4 pl-4 italic my-4" {...p} />,
    hr: (p) => <hr className="my-8" {...p} />,


    // Preserve user-provided overrides last
    ...components,
  };
}