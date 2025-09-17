"use client"
import React from 'react'

export interface YouTubeProps {
  /** Full YouTube URL (watch / youtu.be / embed) or just the video id */
  url?: string
  id?: string
  title?: string
  start?: number
  className?: string
}

function extractId(input: string | undefined): string | null {
  if (!input) return null
  const raw = input.trim()
  // If looks like an id (11 chars, alnum/_-/) try directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw
  try {
    const u = new URL(raw)
    // youtu.be/<id>
    if (/youtu\.be$/i.test(u.hostname)) {
      const id = u.pathname.replace(/^\//,'').split(/[/?#]/)[0]
      if (id) return id
    }
    // youtube.com/watch?v=<id>
    if (/youtube\.com$/i.test(u.hostname)) {
      if (u.pathname === '/watch') {
        const v = u.searchParams.get('v')
        if (v) return v
      }
      // /embed/<id>
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.split('/')[2]
        if (id) return id
      }
      // /shorts/<id>
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2]
        if (id) return id
      }
    }
  } catch {}
  return null
}

export function YouTube({ url, id, title, start, className }: YouTubeProps) {
  const vid = extractId(id || url)
  if (!vid) {
    return <div className={["my-6 p-4 rounded-md border text-sm text-red-500 bg-red-500/5", className].filter(Boolean).join(' ')}>YouTube: video inválido</div>
  }
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
  if (start && Number.isFinite(start) && start! > 0) params.set('start', String(start))
  const src = `https://www.youtube.com/embed/${vid}?${params.toString()}`
  return (
    <div className={["my-8 mx-auto w-full max-w-full sm:max-w-4xl aspect-video relative", className].filter(Boolean).join(' ')}>
      <iframe
        src={src}
        title={title || 'YouTube video'}
        className="absolute inset-0 w-full h-full rounded-lg shadow-sm"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

export default YouTube
