// app/mdx-components.tsx
import * as React from 'react';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';
import CodeBlock from '@/components/code-block';
import YouTube from '@/components/YouTube';

// Helper: external link?
const isExternal = (href?: string) =>
  !!href && /^(https?:)?\/\//i.test(href) && !href.startsWith(process.env.NEXT_PUBLIC_SITE_URL ?? '__not_set__');

// Inline code only (blocks are handled by <Pre/> with <CodeBlock/>)
function InlineCode(props: ComponentPropsWithoutRef<'code'>) {
  const className = props.className ?? '';
  // if a language- class sneaks into inline, just render as-is
  if (/language-/.test(className)) return <code {...props} />;
  return <code {...props} className={['px-1 py-0.5 rounded', className].join(' ').trim()} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Blocks with ```lang → render as CodeBlock with copy + highlight
  const Pre = (p: any) => {
    const child = p?.children?.props; // expected to be the <code> element
    const className: string = child?.className ?? '';
    const isBlock = /language-/.test(className);
    if (isBlock && typeof child?.children === 'string') {
      return <CodeBlock code={child.children} className={className} />;
    }
    // Fallback for non-standard structures
    return (
      <pre className={['rounded-md p-4 my-4 overflow-x-auto', p.className ?? ''].join(' ').trim()}>
        {p.children}
      </pre>
    );
  };
  return {
    // Headings
  h1: (p) => <h1 className="text-3xl font-bold mt-8 mb-4 text-center" {...p} />,
    h2: (p) => (
      <>
        <hr className="heading-separator mt-36 mb-0 border-t border-border" />
        <hr className="heading-separator mt-1 mb-0 border-t border-border" />
        <h2 className="text-2xl font-semibold mt-2 mb-4" {...p} />
      </>
    ), 
  h3: (p) => (
    <>
      <hr className="heading-separator mt-8 mb-0 border-t border-border" />
      <h3 className="text-xl font-bold mt-2 mb-2" {...p} />
    </>
  ),
  h4: (p) => <h4 className="text-l font-semibold mt-4 mb-2" {...p} />, // styled same as h3 per request

    // Text
    p: ({ children, ...rest }) => {
      // Transform <p><img|Img alt="..."/></p> → <figure>...</figure>
      const kids = React.Children.toArray(children)
      if (kids.length === 1 && React.isValidElement(kids[0])) {
        const el: any = kids[0]
        const isHtmlImg = typeof el.type === 'string' && el.type === 'img'
        const isImgComponent = typeof el.type === 'function' && /Img/i.test(el.type.name || '')
        const seemsImage = (el.props && typeof el.props.alt === 'string' && (el.props.src || isHtmlImg || isImgComponent))
        if (isHtmlImg || isImgComponent || seemsImage) {
          const alt = el.props?.alt
          const mergedClass = ['mx-auto','block', el.props?.className].filter(Boolean).join(' ')
            if (alt) {
              return (
                <figure className="my-6 flex flex-col items-center text-center">
                  {React.cloneElement(el, { className: mergedClass })}
                  <figcaption className="mt-2 text-sm text-muted-foreground max-w-prose">{alt}</figcaption>
                </figure>
              )
            }
            return React.cloneElement(el, { className: mergedClass })
        }
      }
      return <p className="leading-7 mb-4 last:mb-0" {...rest}>{children}</p>
    },
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
    code: InlineCode,
    pre: Pre,

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

    // Images: center by default
    img: (p: any) => {
      // Plain img used directly (not inside markdown paragraph) → center by default.
      const { className, ...rest } = p;
      const merged = ['mx-auto','block','my-6','max-w-full','h-auto', className].filter(Boolean).join(' ')
      return <img {...rest} className={merged} />
    },

    // Audio: centered player
    audio: (p: any) => {
      const { className, ...rest } = p;
      const merged = ['block mx-auto my-6 w-full max-w-xl', className].filter(Boolean).join(' ');
      return <audio {...rest} className={merged} />;
    },

  // Video: responsive, centered, constrained width
    video: (p: any) => {
      const { className, ...rest } = p;
      const merged = [
        'block mx-auto my-8 w-full max-w-4xl aspect-video rounded-lg bg-black',
        className,
      ].filter(Boolean).join(' ');
      return <video {...rest} className={merged} />;
    },

  // Custom YouTube embed shortcut <YouTube url="..." />
  YouTube,


    // Preserve user-provided overrides last
    ...components,
  };
}