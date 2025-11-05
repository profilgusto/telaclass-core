"use client"
import React from 'react'

export interface VimeoProps {
  /** Full Vimeo URL (vimeo.com/<id>) or just the video id */
  url?: string
  id?: string
  title?: string
  className?: string
}

function extractId(input: string | undefined): string | null {
  if (!input) return null
  const raw = input.trim()
  // If looks like an id (numbers only) try directly
  if (/^\d+$/.test(raw)) return raw
  try {
    const u = new URL(raw)
    // vimeo.com/<id>
    if (/vimeo\.com$/i.test(u.hostname)) {
      const id = u.pathname.replace(/^\//,'').split(/[/?#]/)[0]
      if (id && /^\d+$/.test(id)) return id
    }
  } catch {}
  return null
}

export function Vimeo({ url, id, title, className }: VimeoProps) {
  const vid = extractId(id || url)
  if (!vid) {
    return <div className={["my-6 p-4 rounded-md border text-sm text-red-500 bg-red-500/5", className].filter(Boolean).join(' ')}>Vimeo: video inválido</div>
  }
  const src = `https://player.vimeo.com/video/${vid}?badge=0&autopause=0&player_id=0&app_id=58479`
  return (
    <div className={["my-8 mx-auto w-full max-w-full sm:max-w-4xl aspect-video relative", className].filter(Boolean).join(' ')}>
      <iframe
        src={src}
        title={title || 'Vimeo video'}
        className="absolute inset-0 w-full h-full rounded-lg shadow-sm"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}

export default Vimeo
