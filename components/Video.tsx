"use client"
import React from 'react'

export type VideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string
  webm?: string
  ogg?: string
  mp4?: string
  className?: string
}

/**
 * Simple, accessible video player.
 * - Full width, keeps aspect ratio.
 * - Rounded corners and dark background to avoid white flashes.
 * - Controls enabled by default (can be overridden).
 */
export default function Video({ className, children, controls = true, preload = 'metadata', src, webm, ogg, mp4, ...rest }: VideoProps) {
  const merged = [
    'block mx-auto my-8 w-full max-w-4xl aspect-video rounded-lg bg-black',
    className,
  ].filter(Boolean).join(' ')
  // Build sources list for fallback codecs
  const sources: Array<{ src: string; type: string }> = []
  if (webm) sources.push({ src: webm, type: 'video/webm' })
  if (ogg) sources.push({ src: ogg, type: 'video/ogg' })
  const primaryType = (src.endsWith('.webm') ? 'video/webm' : src.endsWith('.ogg') ? 'video/ogg' : 'video/mp4')
  if (mp4) sources.push({ src: mp4, type: 'video/mp4' })
  // Always include primary src last so explicit alternatives are preferred
  sources.push({ src, type: primaryType })
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (rest.onError) return rest.onError(e)
    try { console.error('[Video] failed to load', { src }) } catch {}
  }
  return (
    <video className={merged} controls={controls} preload={preload} onError={handleError} {...rest}>
      {/* Provide <source> fallbacks for better browser compatibility */}
      {!children ? sources.map((s, i) => (
        <source key={i} src={s.src} type={s.type} />
      )) : null}
      {children}
      {/* Minimal inline fallback text for error cases */}
      {!children ? <track kind="captions" /> : null}
    </video>
  )
}
