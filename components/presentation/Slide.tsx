'use client'
"use client"
import { ReactNode } from 'react'
import { useViewMode } from './useViewMode'
import SlideLayout from './SlideLayouts'

function clsx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function Slide({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const mode = useViewMode()
  const isPresentation = mode === 'apresentacao'
  
  // Extract layout from data attributes
  const layout = (rest as any)['data-layout'] || '1'
  
  return (
    <section
      {...rest}
      className={clsx(
        isPresentation && 'relative mx-auto my-8 max-w-4xl px-6 py-8 rounded-2xl shadow-sm bg-[var(--bg)] text-[var(--fg)]',
        className
      )}
    >
      <SlideLayout layout={layout}>
        {children}
      </SlideLayout>
    </section>
  )
}