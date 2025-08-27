'use client'
import { ReactNode } from 'react'
import clsx from 'clsx'
import { useViewMode } from './useViewMode'

export default function Slide({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const mode = useViewMode()
  // No modo texto não altera layout: renderiza filhos "inline" (sem card)
  if (mode !== 'apresentacao') {
    return <>{children}</>
  }
  return (
    <section
      {...rest}
      className={clsx(
        'relative mx-auto my-8 max-w-4xl px-6 py-8 rounded-2xl shadow-sm',
        'bg-[var(--bg)] text-[var(--fg)]',
        className
      )}
    >
      {children}
    </section>
  )
}