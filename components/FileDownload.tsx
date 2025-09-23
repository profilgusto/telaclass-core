"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DownloadCloud,
  FileArchive,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  src?: string
  desc?: string
  className?: string
  variant?: 'default' | 'compact'
}

function pickIconFromExt(fileName: string | undefined) {
  if (!fileName) return DownloadCloud
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  switch (ext) {
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'tgz':
      return FileArchive
    case 'pdf':
      return FileDown
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'gif':
    case 'svg':
      return FileImage
    case 'mp4':
    case 'webm':
    case 'mov':
    case 'mkv':
      return FileVideo
    case 'mp3':
    case 'wav':
    case 'ogg':
      return FileAudio
    case 'csv':
    case 'xls':
    case 'xlsx':
      return FileSpreadsheet
    case 'md':
    case 'txt':
    case 'rtf':
      return FileText
    case 'js':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'rs':
      return FileCode
    default:
      return DownloadCloud
  }
}

export default function FileDownload({ src, desc, className, variant = 'default' }: Props) {
  const url = typeof src === 'string' ? src : ''
  const label = desc || 'Baixar arquivo'
  const fileName = (() => {
    if (!url) return ''
    try {
      const parts = url.split('?')[0].split('#')[0].split('/')
      return decodeURIComponent(parts[parts.length - 1] || '')
    } catch {
      return ''
    }
  })()
  const Icon = pickIconFromExt(fileName)
  if (variant === 'compact') {
    return (
      <div className={['my-4 flex justify-center', className].filter(Boolean).join(' ')}>
        {url ? (
          <Button asChild variant="default" size="lg" className="gap-2">
            <a href={url} download className="no-underline" aria-label={`Baixar ${fileName || 'arquivo'}`}>
              <Icon className="size-5" aria-hidden="true" />
              <span>{label}</span>
            </a>
          </Button>
        ) : (
          <Button variant="default" size="lg" className="gap-2" disabled>
            <Icon className="size-5" aria-hidden="true" />
            <span>{label}</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={['my-6', className].filter(Boolean).join(' ')}>
      <Card className="max-w-2xl mx-auto">
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-center self-start sm:self-auto h-12 w-12 rounded-full bg-secondary text-secondary-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-tight break-words">
                {label}
              </div>
              {fileName && (
                <div className="text-xs text-muted-foreground mt-1 break-all">{fileName}</div>
              )}
            </div>
            {url ? (
              <Button asChild variant="default" size="lg" className="gap-2 shrink-0">
                <a href={url} download className="no-underline" aria-label={`Baixar ${fileName || 'arquivo'}`}>
                  <DownloadCloud className="size-5" aria-hidden="true" />
                  <span>Baixar</span>
                </a>
              </Button>
            ) : (
              <Button variant="default" size="lg" className="gap-2 shrink-0" disabled>
                <DownloadCloud className="size-5" aria-hidden="true" />
                <span>Baixar</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
