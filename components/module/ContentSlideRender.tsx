"use client"
import dynamic from 'next/dynamic'
import { ModuleContentCore } from './ModuleContentCore'

interface Props {
  manifestKey: string
  slug: string
  mod: string
  active: boolean
}

// Lazy-load SlideDeck only for presentation mode to reduce initial bundle
const SlideDeck = dynamic(() => import('@/components/presentation/SlideDeck'), {
  ssr: false,
  loading: () => <div className="prose max-w-none opacity-60">Carregando slides…</div>
})

export function ContentSlideRender({ manifestKey, slug, mod, active }: Props) {
  return (
    <div className={[active ? '' : 'hidden', 'min-h-screen flex flex-col'].join(' ')}>
      <div className="flex-1 min-w-0 py-[var(--space-md)]">
        <ModuleContentCore
          manifestKey={manifestKey}
          slug={slug}
          mod={mod}
          mode="apresentacao"
          wrapWithSlideDeck={(children) => <SlideDeck>{children}</SlideDeck>}
        />
      </div>
    </div>
  )
}
