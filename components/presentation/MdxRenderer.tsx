'use client'

import { useEffect, useState, useMemo } from 'react'
import { MDXProvider } from '@mdx-js/react'
import SlideDeck from '@/components/presentation/SlideDeck'
import Slide from '@/components/presentation/Slide'
import { PresentOnly, TextOnly } from '@/components/presentation/Only'
import { MDX_MANIFEST } from '@/content/mdx-manifest'

type Props = {
  manifestKey: string
  slug: string
  mod: string
}

export default function MdxRenderer({ manifestKey, slug, mod }: Props) {
  const [MDX, setMDX] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    let alive = true
    const loader = MDX_MANIFEST[manifestKey]
    if (!loader) {
      console.error('[MdxRenderer] manifest key not found:', manifestKey)
      return
    }
    loader().then((mod) => {
      if (alive) setMDX(() => mod.default as any)
    })
    return () => { alive = false }
  }, [manifestKey])

  // componentes de reescrita relativos (CLIENTE)
  const Img = useMemo(() => {
    return function Img({
      src,
      alt,
      ...rest
    }: { src?: string; alt?: string } & Record<string, any>) {
      const s = typeof src === 'string' ? src : ''
      const isAbsolute = /^([a-z]+:)?\/\//i.test(s) || s.startsWith('/')

      const normalized = !isAbsolute
        ? `${s.includes('/') ? s : `img/${s}`}`.replace(/^\.?\/*/, '')
        : s

      const encoded = normalized.split('/').map(encodeURIComponent).join('/')

      const url = isAbsolute
        ? s
        : `/disciplinas/${encodeURIComponent(slug)}/${encodeURIComponent(mod)}/${encoded}`

      return <img src={url} alt={alt ?? ''} {...rest} />
    }
  }, [slug, mod])

  const A = useMemo(() => {
    return function A({
      href,
      children,
      ...rest
    }: { href?: string } & Record<string, any>) {
      const h = typeof href === 'string' ? href : ''
      const isAbsolute = /^([a-z]+:)?\/\//i.test(h) || h.startsWith('/')
      if (isAbsolute) {
        const external = /^https?:\/\//i.test(h)
        if (external) {
          return (
            <a href={h} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }} {...rest}>
              {children}
            </a>
          )
        }
        return (
          <a href={h} style={{ textDecoration: 'underline' }} {...rest}>
            {children}
          </a>
        )
      }
      const normalized = h.replace(/^\.\/+/, '')
      const encoded = normalized.split('/').map(encodeURIComponent).join('/')
      const url = `/disciplinas/${encodeURIComponent(slug)}/${encodeURIComponent(mod)}/${encoded}`
      return (
        <a href={url} style={{ textDecoration: 'underline' }} {...rest}>
          {children}
        </a>
      )
    }
  }, [slug, mod])

  const components = useMemo(
    () => ({ img: Img, a: A, Slide, PresentOnly, TextOnly }),
    [Img, A]
  )

  if (!MDX) {
    return <div className="prose max-w-none opacity-60">Carregando…</div>
  }

  return (
    <SlideDeck>
      <MDXProvider components={components}>
        <div className="prose max-w-none">
          <MDX components={components} />
        </div>
      </MDXProvider>
    </SlideDeck>
  )
}