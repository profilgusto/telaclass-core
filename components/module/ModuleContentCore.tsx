"use client"
import React, { useEffect, useState } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { MDX_MANIFEST } from '@/content/mdx-manifest'
import { useMdxOverrides } from './mdxOverrides'
import { ViewModeProvider } from '@/components/presentation/useViewMode'

export type ModuleContentMode = 'texto' | 'apresentacao'

export interface ModuleContentCoreProps {
  manifestKey: string
  slug: string
  mod: string
  mode: ModuleContentMode
  wrapWithSlideDeck?: (children: React.ReactNode) => React.ReactNode
}

// Caches loaded MDX components per manifest key (module-level singleton)
const mdxCache = new Map<string, React.ComponentType<any>>()

export function ModuleContentCore({ manifestKey, slug, mod, mode, wrapWithSlideDeck }: ModuleContentCoreProps) {
  const [MDX, setMDX] = useState<React.ComponentType<any> | null>(() => mdxCache.get(manifestKey) || null)

  // Load (or reuse) MDX component
  useEffect(() => {
    if (mdxCache.has(manifestKey)) {
      setMDX(() => mdxCache.get(manifestKey)!)
      return
    }
    let alive = true
    const loader = MDX_MANIFEST[manifestKey]
    if (!loader) {
      console.error('[ModuleContentCore] manifest key not found:', manifestKey)
      return
    }
    loader().then((modFile) => {
      if (!alive) return
      const Comp = modFile.default as React.ComponentType<any>
      mdxCache.set(manifestKey, Comp)
      setMDX(() => Comp)
    })
    return () => { alive = false }
  }, [manifestKey])

  const components = useMdxOverrides({ slug, mod })

  if (!MDX) {
    return <div className="prose max-w-none opacity-60">Carregando…</div>
  }

  const content = (
    <ViewModeProvider mode={mode}>
      <MDXProvider components={components}>
        <div
          className={[
            'prose max-w-none',
            mode === 'apresentacao' && 'prose-presentation'
          ].filter(Boolean).join(' ')}
        >
          <MDX components={components} />
        </div>
      </MDXProvider>
    </ViewModeProvider>
  )

  return wrapWithSlideDeck ? wrapWithSlideDeck(content) : content
}
