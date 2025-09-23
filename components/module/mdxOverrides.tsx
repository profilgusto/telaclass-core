"use client"
import React, { useMemo, cloneElement } from 'react'
import Slide from '@/components/presentation/Slide'
import YouTube from '@/components/YouTube'
import { PresentOnly, TextOnly } from '@/components/presentation/Only'
import { useViewMode } from '@/components/presentation/useViewMode'
import VideoBase from '@/components/Video'
import PDFBase from '@/components/PDF'
import FileDownloadBase from '@/components/FileDownload'

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
      // Inline mode (triggered by paragraph when mixing text + images)
      const isInline = !!(rest as any)['data-inline']
      if (isInline) {
        // height in em units via title: "ih=1.2" or via data-ih
        const dataIh = (rest as any)['data-ih'] as string | undefined
        const m = dataIh ? [null, dataIh] : (typeof title === 'string' ? title.match(/(?:^|\s)ih=([0-9]*\.?[0-9]+)(?=\s|$)/i) : null)
        const h = m ? `${m[1]}em` : '1em'
        const inlineCls = ['mdx-inline-img','inline-block','align-middle','mx-1','my-0', className].filter(Boolean).join(' ')
        return <img src={url} alt={alt} className={inlineCls} style={{ ...(style||{}), height: h, width: 'auto' }} {...others} />
      }
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
    // Uppercase component for MDX usage: <Video src="videos/foo.mp4" />
    const VideoUpper = (p: any) => {
      const { src, ...rest } = p
      const url = normalize(src)
      return <VideoBase src={url} {...rest} />
    }
    const PDF = (p: any) => {
      const { src, ...rest } = p
      const url = normalize(src)
      return <PDFBase src={url} {...rest} />
    }
    const FileDownload = (p: any) => {
      const { src, ...rest } = p
      const url = normalize(src)
      return <FileDownloadBase src={url} {...rest} />
    }
    return { audio: Audio, video: Video, Video: VideoUpper, PDF, FileDownload }
  }, [slug, mod])

  const Paragraph = useMemo(() => {
    return function P({ children, ...rest }: any) {
      const arr = React.Children.toArray(children)

      // Helpers
      const isImageLike = (el: any) => {
        const isHtmlImg = el?.type === 'img'
        const isImgComponent = typeof el?.type === 'function' && /Img/i.test(el.type.name || '')
        const seemsImage = !!(el?.props && (el.props.src || isHtmlImg || isImgComponent))
        return isHtmlImg || isImgComponent || seemsImage
      }
      const isBlockLike = (el: any) => {
        if (!el || typeof el !== 'object') return false
        const t = el.type
        // Known block components that render <div>/<iframe>/<section> etc.
        if (t === YouTube || t === VideoBase || t === PDFBase || t === FileDownloadBase) return true
        const name = typeof t === 'function' ? (t as any).name : ''
        if (typeof t === 'string') return ['div','section','iframe','figure','video','audio'].includes(t)
        return /YouTube|Video|PDF|FileDownload/.test(name || '')
      }

      // Single media/image paragraph transformation
      if (arr.length === 1 && arr[0] && typeof arr[0] === 'object') {
        const el: any = arr[0]
        // Single block element? Return it directly, do not wrap in <p>
        if (isBlockLike(el)) return el
        // Single image gets upgraded to <figure> with optional caption from alt
        if (isImageLike(el)) {
          const alt = el.props?.alt
          const base = ['mx-auto','block','max-w-full','h-auto', el.props.className].filter(Boolean).join(' ')
          if (alt) {
            return (
              <figure className="my-6 flex flex-col items-center text-center">
                {cloneElement(el, { className: base })}
                <figcaption className="mt-2 text-sm opacity-80 max-w-prose">{alt}</figcaption>
              </figure>
            )
          }
          return cloneElement(el, { className: base })
        }
      }

      // If this paragraph mixes text with block components, split into multiple blocks
      const containsBlock = arr.some((n) => typeof n === 'object' && isBlockLike(n as any))
      if (containsBlock) {
        const out: React.ReactNode[] = []
        let buffer: React.ReactNode[] = []
        const flush = () => {
          if (buffer.length) {
            out.push(
              <p key={`p-${out.length}`} className={['last:mb-0', rest.className].filter(Boolean).join(' ')} {...rest}>
                {buffer}
              </p>
            )
            buffer = []
          }
        }
        arr.forEach((node, idx) => {
          if (typeof node === 'object' && isBlockLike(node as any)) {
            flush()
            out.push(cloneElement(node as any, { key: `block-${idx}` }))
          } else if (typeof node === 'object' && isImageLike(node as any)) {
            const el: any = node
            const title: string | undefined = el.props?.title
            const m = typeof title === 'string' ? title.match(/(?:^|\s)ih=([0-9]*\.?[0-9]+)(?=\s|$)/i) : null
            const ih = m ? m[1] : undefined
            buffer.push(cloneElement(el, { 'data-inline': true, 'data-ih': ih, key: `img-${idx}` }))
          } else {
            buffer.push(node)
          }
        })
        flush()
        return <>{out}</>
      }

      // Inline images within text: convert any image-like children to inline icons
      const inlineKids = arr.map((node, idx) => {
        if (!node || typeof node !== 'object') return node
        const el: any = node
        if (!isImageLike(el)) return node
        const title: string | undefined = el.props?.title
        const m = typeof title === 'string' ? title.match(/(?:^|\s)ih=([0-9]*\.?[0-9]+)(?=\s|$)/i) : null
        const ih = m ? m[1] : undefined
        return cloneElement(el, { 'data-inline': true, 'data-ih': ih, key: `img-inline-${idx}` })
      })
      return <p className={['last:mb-0', rest.className].filter(Boolean).join(' ')} {...rest}>{inlineKids}</p>
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
