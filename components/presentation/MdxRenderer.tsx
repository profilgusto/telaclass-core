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

  // Ensure centered image: combine existing className with our defaults
  const { className, ...others } = rest
  const merged = ['mx-auto my-6 block', className].filter(Boolean).join(' ')
  if (!alt) return <img src={url} alt="" className={merged} {...others} />
  return (
    <figure className="my-6 flex flex-col items-center text-center">
      <img src={url} alt={alt} className={merged} {...others} />
      <figcaption className="mt-2 text-sm opacity-80 max-w-prose">{alt}</figcaption>
    </figure>
  )
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

  const MediaResolvers = useMemo(() => {
    function normalize(src: string | undefined) {
      const s = typeof src === 'string' ? src : ''
      const isAbs = /^([a-z]+:)?\/\//i.test(s) || s.startsWith('/')
      if (isAbs) return s
      const normalized = s.replace(/^\.\/?/, '')
      const encoded = normalized.split('/').map(encodeURIComponent).join('/')
      return `/disciplinas/${encodeURIComponent(slug)}/${encodeURIComponent(mod)}/${encoded}`
    }
    const Audio = (p: any) => {
      const { className, src, ...rest } = p
      const merged = ['block mx-auto my-6 w-full max-w-xl', className].filter(Boolean).join(' ')
      return <audio src={normalize(src)} className={merged} {...rest} />
    }
    const Video = (p: any) => {
      const { className, src, ...rest } = p
      const merged = ['block mx-auto my-8 w-full max-w-4xl aspect-video rounded-lg bg-black', className].filter(Boolean).join(' ')
      return <video src={normalize(src)} className={merged} {...rest} />
    }
    return { audio: Audio, video: Video }
  }, [slug, mod])

  const components = useMemo(
    () => ({ img: Img, a: A, Slide, PresentOnly, TextOnly, ...MediaResolvers }),
    [Img, A, MediaResolvers]
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