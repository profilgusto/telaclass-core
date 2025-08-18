'use client';

import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import '../styles/hljs.css';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  code?: string | React.ReactNode;
  className?: string;
};

export default function CodeBlock({ code, className }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const lang =
    (className || '').match(/language-([A-Za-z0-9+-]+)/)?.[1] ?? undefined;

  useEffect(() => {
    if (codeRef.current) {
      try {
        hljs.highlightElement(codeRef.current);
      } catch {
        /* noop */
      }
    }
  }, [className, code]);

  const extractText = () => {
    if (typeof code === 'string') return code;
    return preRef.current?.innerText ?? '';
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mx-auto my-6 max-w-3xl">
      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50 dark:bg-zinc-900">
        <button
          onClick={onCopy}
          aria-label={copied ? 'Código copiado' : 'Copiar código'}
          title={copied ? 'Copiado' : 'Copiar'}
          className="absolute right-1 top-1 inline-flex items-center justify-center h-6 w-6 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 hover:bg-white dark:hover:bg-zinc-700"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        {lang && (
          <span className="absolute left-3 top-2 text-[10px] uppercase tracking-wider text-zinc-500">
            {lang}
          </span>
        )}
        <pre
          ref={preRef}
          className={clsx(
            'overflow-x-auto p-4 pt-7 rounded-md',
            // fundo claro/escuro forçado para evitar tema escuro em modo claro
            'bg-[#f6f8fa] dark:bg-[#0d1117]'
          )}
        >
          <code ref={codeRef} className={clsx(className, 'hljs')}>
            {typeof code === 'string' ? code : (code as any)}
          </code>
        </pre>
      </div>
    </div>
  );
}




