"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { DownloadCloud } from 'lucide-react'

type Props = {
  src?: string
  desc?: string
  className?: string
}

export default function FileDownloadButton({ src, desc, className }: Props) {
  const url = typeof src === 'string' ? src : ''
  const label = desc || 'Baixar arquivo'
  return (
    <div className={['my-4 flex justify-center', className].filter(Boolean).join(' ')}>
      <Button asChild variant="default" size="lg" className="gap-2">
        <a href={url} download className="no-underline">
          <DownloadCloud className="size-5" aria-hidden="true" />
          <span>{label}</span>
        </a>
      </Button>
    </div>
  )
}
