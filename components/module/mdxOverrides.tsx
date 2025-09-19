"use client"
import React, { useMemo, cloneElement } from 'react'
import Slide from '@/components/presentation/Slide'
import YouTube from '@/components/YouTube'
import { PresentOnly, TextOnly } from '@/components/presentation/Only'
import { useViewMode } from '@/components/presentation/useViewMode'

export interface OverrideDeps {
  slug: string
  mod: string
}

export function useMdxOverrides({ slug, mod }: OverrideDeps) {
  const Img = useMemo(() => {
    return function Img({ src, alt, ...rest }: { src?: string; alt?: string; title?: string } & Record<string, any>) {
      const s = typeof src === 'string' ? src : ''
      const isAbsolute = /^([a-z]+:)?\/\//i.test(s) || s.startsWith('/')
      const normalized = !isAbsolute ? `${s.includes('/') ? s : `img/${s}`}`.replace(/^\.?\/*/, '') : s
      const encoded = normalized.split('/').map(encodeURIComponent).join('/')
      const url = isAbsolute ? s : `/disciplinas/${encodeURIComponent(slug)}/${encodeURIComponent(mod)}/${encoded}`
      const { className, title, style, ...others } = rest
      // Parse optional widths from title: e.g., "wsm=100 wlg=60" (percent of viewport width)
      let wsm: number | undefined
      let wlg: number | undefined
      if (typeof title === 'string' && title) {
        const mSm = title.match(/(?:^|\s)wsm=(\d{1,3})(?=\s|$)/i)
        const mLg = title.match(/(?:^|\s)wlg=(\d{1,3})(?=\s|$)/i)
        if (mSm) wsm = Math.max(0, Math.min(100, parseInt(mSm[1], 10)))
        if (mLg) wlg = Math.max(0, Math.min(100, parseInt(mLg[1], 10)))
        // Alternative format: size=SM,LG
        if (!mSm || !mLg) {
          const altFmt = title.match(/(?:^|\s)size=(\d{1,3})\s*,\s*(\d{1,3})(?=\s|$)/i)
          if (altFmt) {
            wsm = wsm ?? Math.max(0, Math.min(100, parseInt(altFmt[1], 10)))
            wlg = wlg ?? Math.max(0, Math.min(100, parseInt(altFmt[2], 10)))
          }
        }
      }
      const merged = ['mx-auto','block','max-w-full','h-auto','mdx-img', className].filter(Boolean).join(' ')
      const styleVars: any = { ...style }
      if (typeof wsm === 'number') styleVars['--mdx-img-wsm'] = `${wsm}vw`
      if (typeof wlg === 'number') styleVars['--mdx-img-wlg'] = `${wlg}vw`
      return <img src={url} alt={alt} className={merged} style={styleVars} {...others} />
    }
  }, [slug, mod])

  const A = useMemo(() => {
    return function A({ href, children, ...rest }: { href?: string } & Record<string, any>) {
      const h = typeof href === 'string' ? href : ''
      const isAbsolute = /^([a-z]+:)?\/\//i.test(h) || h.startsWith('/')
      if (isAbsolute) {
        const external = /^https?:\/\//i.test(h)
        if (external) return <a href={h} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }} {...rest}>{children}</a>
        return <a href={h} style={{ textDecoration: 'underline' }} {...rest}>{children}</a>
      }
      const normalized = h.replace(/^\.\/+/, '')
      const encoded = normalized.split('/').map(encodeURIComponent).join('/')
      const url = `/disciplinas/${encodeURIComponent(slug)}/${encodeURIComponent(mod)}/${encoded}`
      return <a href={url} style={{ textDecoration: 'underline' }} {...rest}>{children}</a>
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

  const Paragraph = useMemo(() => {
    return function P({ children, ...rest }: any) {
      const arr = Array.isArray(children) ? children : [children]
      if (arr.length === 1 && arr[0] && typeof arr[0] === 'object') {
        const el: any = arr[0]
        const isHtmlImg = el.type === 'img'
        const isImgComponent = typeof el.type === 'function' && /Img/i.test(el.type.name || '')
        const seemsImage = (el.props && typeof el.props.alt === 'string' && (el.props.src || isHtmlImg || isImgComponent))
        if (isHtmlImg || isImgComponent || seemsImage) {
          const alt = el.props?.alt
          const base = ['mx-auto','block','max-w-full','h-auto', el.props.className].filter(Boolean).join(' ')
          if (alt) return (
            <figure className="my-6 flex flex-col items-center text-center">
              {cloneElement(el, { className: base })}
              <figcaption className="mt-2 text-sm opacity-80 max-w-prose">{alt}</figcaption>
            </figure>
          )
          return cloneElement(el, { className: base })
        }
      }
      return <p className={['last:mb-0', rest.className].filter(Boolean).join(' ')} {...rest}>{children}</p>
    }
  }, [])

  const components = useMemo(() => {
    const H2 = (p: any) => {
      const mode = useViewMode()
      return (
        <>
          {mode === 'texto' && (
            <>
              <hr className="mt-32 mb-0 border-t border-border" />
            </>
          )}
          <h2 className={['text-2xl','font-semibold','mt-2','mb-4', p.className].filter(Boolean).join(' ')} {...p} />
        </>
      )
    }
    const H4 = (p: any) => {
      const mode = useViewMode()
      // In text mode style identical to h3 request; in presentation we keep a slight size drop
      const base = mode === 'texto'
        ? ['text-xl','font-semibold','mt-4','mb-2']
        : ['text-lg','font-semibold','mt-4','mb-2']
      return <h4 className={[...base, p.className].filter(Boolean).join(' ')} {...p} />
    }
    return {
      p: Paragraph,
      h2: H2,
      h4: H4,
      img: Img,
      a: A,
      Slide,
      PresentOnly,
      TextOnly,
  ...MediaResolvers,
  YouTube
    }
  }, [Paragraph, Img, A, MediaResolvers])

  return components
}
