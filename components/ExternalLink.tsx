"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  url?: string
  title?: string
  className?: string
  variant?: 'default' | 'compact'
  showFavicon?: boolean
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return null
  }
}

function getFaviconUrl(url: string): string | null {
  const domain = extractDomain(url)
  if (!domain) return null
  
  // Using Google's favicon service as a reliable fallback
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

export default function ExternalLink({ 
  url, 
  title, 
  className, 
  variant = 'default',
  showFavicon = true 
}: Props) {
  const [faviconError, setFaviconError] = useState(false)
  
  const href = typeof url === 'string' ? url : ''
  const label = title || href
  const domain = href ? extractDomain(href) : null
  const faviconUrl = showFavicon && href ? getFaviconUrl(href) : null
  const shouldShowFavicon = showFavicon && faviconUrl && !faviconError

  if (variant === 'compact') {
    return (
      <div className={['my-4 flex justify-center', className].filter(Boolean).join(' ')}>
        {href ? (
          <Button asChild variant="default" size="lg" className="gap-2">
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="no-underline" 
              aria-label={`Visitar ${label}`}
            >
              <ExternalLinkIcon className="size-5" aria-hidden="true" />
              <span>{label}</span>
            </a>
          </Button>
        ) : (
          <Button variant="default" size="lg" className="gap-2" disabled>
            <ExternalLinkIcon className="size-5" aria-hidden="true" />
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
            <div className="flex items-center justify-center self-start sm:self-auto h-12 w-12 rounded-full bg-secondary text-secondary-foreground overflow-hidden">
              {shouldShowFavicon ? (
                <img 
                  src={faviconUrl} 
                  alt=""
                  className="size-6 object-contain"
                  onError={() => setFaviconError(true)}
                  aria-hidden="true"
                />
              ) : (
                <ExternalLinkIcon className="size-5" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-tight break-words">
                {label}
              </div>
              {domain && (
                <div className="text-xs text-muted-foreground mt-1 break-all">{domain}</div>
              )}
            </div>
            {href ? (
              <Button asChild variant="default" size="lg" className="gap-2 shrink-0">
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="no-underline" 
                  aria-label={`Visitar ${label}`}
                >
                  <ExternalLinkIcon className="size-5" aria-hidden="true" />
                  <span>Visitar</span>
                </a>
              </Button>
            ) : (
              <Button variant="default" size="lg" className="gap-2 shrink-0" disabled>
                <ExternalLinkIcon className="size-5" aria-hidden="true" />
                <span>Visitar</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
