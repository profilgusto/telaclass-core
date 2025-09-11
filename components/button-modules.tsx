import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { buttonVariants } from '@/components/ui/button'

/** Lista canônica de cores suportadas (Tailwind default). */
export const COLOR_NAMES = [
  'red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose','slate','gray','zinc','neutral','stone'
] as const
export type ColorName = typeof COLOR_NAMES[number]

export interface ModuleButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  /** Texto curto opcional (ex: "Módulo teórico 1"). Se não informado, só mostra o título. */
  badge?: string
  title: string
  /** Nome da cor Tailwind (sem shade). */
  colorTailWind: ColorName | string
  className?: string
}

/**
 * Constrói classes utilitárias Tailwind para uma cor.
 * Observação: para garantir que o JIT não remova as classes dinâmicas, mantemos um bloco safelist abaixo.
 */
function buildColorClasses(color: string) {
  // Shades escolhidos (coerentes com os anteriores). Fallback neutro se algo inesperado.
  const container = `!bg-${color}-50 dark:!bg-${color}-950/30 !border-${color}-200 dark:!border-${color}-950/70 hover:!bg-${color}-100 dark:hover:!bg-${color}-950/50 transition-colors`
  const badge = `text-${color}-900 dark:text-${color}-200`
  const title = `text-${color}-950 dark:text-${color}-100`
  return { container, badge, title }
}

export function ButtonModules({ href, badge, title, colorTailWind, className, ...rest }: ModuleButtonProps) {
  const { container, title: titleCls } = buildColorClasses(colorTailWind)
  const showBadge = !!badge
  return (
    <Link
      href={href}
      className={clsx(
        buttonVariants({ variant: 'outline', size: 'lg' }),
        'justify-start h-auto py-4 flex flex-col items-start text-left !whitespace-normal break-words',
        showBadge && 'space-y-1',
        container,
        className
      )}
      {...rest}
    >
      {showBadge && (
        <span className={clsx('text-xs uppercase tracking-wide font-medium text-muted-foreground')}>{badge}</span>
      )}
      <span className={clsx('text-base font-semibold leading-snug line-clamp-2 break-words whitespace-normal', titleCls)}>{title}</span>
    </Link>
  )
}

/*
  Safelist: enumerate classes para todas as cores para que Tailwind não as remova.
  (Mantido em template string para não poluir bundle – removido no build.)
*/
// prettier-ignore
// Safelist ESTÁTICO: precisa ser literal para o scanner do Tailwind manter as classes.
// Inclui variantes de container (bg/border/hover) + textos (badge/title) claro/escuro.
const __TAILWIND_SAFELIST = `
!bg-red-50 dark:!bg-red-950/30 !border-red-200 dark:!border-red-950/70 hover:!bg-red-100 dark:hover:!bg-red-950/50 text-red-900 text-red-950 dark:text-red-200 dark:text-red-100
!bg-orange-50 dark:!bg-orange-950/30 !border-orange-200 dark:!border-orange-950/70 hover:!bg-orange-100 dark:hover:!bg-orange-950/50 text-orange-900 text-orange-950 dark:text-orange-200 dark:text-orange-100
!bg-amber-50 dark:!bg-amber-950/30 !border-amber-200 dark:!border-amber-950/70 hover:!bg-amber-100 dark:hover:!bg-amber-950/50 text-amber-900 text-amber-950 dark:text-amber-200 dark:text-amber-100
!bg-yellow-50 dark:!bg-yellow-950/30 !border-yellow-200 dark:!border-yellow-950/70 hover:!bg-yellow-100 dark:hover:!bg-yellow-950/50 text-yellow-900 text-yellow-950 dark:text-yellow-200 dark:text-yellow-100
!bg-lime-50 dark:!bg-lime-950/30 !border-lime-200 dark:!border-lime-950/70 hover:!bg-lime-100 dark:hover:!bg-lime-950/50 text-lime-900 text-lime-950 dark:text-lime-200 dark:text-lime-100
!bg-green-50 dark:!bg-green-950/30 !border-green-200 dark:!border-green-950/70 hover:!bg-green-100 dark:hover:!bg-green-950/50 text-green-900 text-green-950 dark:text-green-200 dark:text-green-100
!bg-emerald-50 dark:!bg-emerald-950/30 !border-emerald-200 dark:!border-emerald-950/70 hover:!bg-emerald-100 dark:hover:!bg-emerald-950/50 text-emerald-900 text-emerald-950 dark:text-emerald-200 dark:text-emerald-100
!bg-teal-50 dark:!bg-teal-950/30 !border-teal-200 dark:!border-teal-950/70 hover:!bg-teal-100 dark:hover:!bg-teal-950/50 text-teal-900 text-teal-950 dark:text-teal-200 dark:text-teal-100
!bg-cyan-50 dark:!bg-cyan-950/30 !border-cyan-200 dark:!border-cyan-950/70 hover:!bg-cyan-100 dark:hover:!bg-cyan-950/50 text-cyan-900 text-cyan-950 dark:text-cyan-200 dark:text-cyan-100
!bg-sky-50 dark:!bg-sky-950/30 !border-sky-200 dark:!border-sky-950/70 hover:!bg-sky-100 dark:hover:!bg-sky-950/50 text-sky-900 text-sky-950 dark:text-sky-200 dark:text-sky-100
!bg-blue-50 dark:!bg-blue-950/30 !border-blue-200 dark:!border-blue-950/70 hover:!bg-blue-100 dark:hover:!bg-blue-950/50 text-blue-900 text-blue-950 dark:text-blue-200 dark:text-blue-100
!bg-indigo-50 dark:!bg-indigo-950/30 !border-indigo-200 dark:!border-indigo-950/70 hover:!bg-indigo-100 dark:hover:!bg-indigo-950/50 text-indigo-900 text-indigo-950 dark:text-indigo-200 dark:text-indigo-100
!bg-violet-50 dark:!bg-violet-950/30 !border-violet-200 dark:!border-violet-950/70 hover:!bg-violet-100 dark:hover:!bg-violet-950/50 text-violet-900 text-violet-950 dark:text-violet-200 dark:text-violet-100
!bg-purple-50 dark:!bg-purple-950/30 !border-purple-200 dark:!border-purple-950/70 hover:!bg-purple-100 dark:hover:!bg-purple-950/50 text-purple-900 text-purple-950 dark:text-purple-200 dark:text-purple-100
!bg-fuchsia-50 dark:!bg-fuchsia-950/30 !border-fuchsia-200 dark:!border-fuchsia-950/70 hover:!bg-fuchsia-100 dark:hover:!bg-fuchsia-950/50 text-fuchsia-900 text-fuchsia-950 dark:text-fuchsia-200 dark:text-fuchsia-100
!bg-pink-50 dark:!bg-pink-950/30 !border-pink-200 dark:!border-pink-950/70 hover:!bg-pink-100 dark:hover:!bg-pink-950/50 text-pink-900 text-pink-950 dark:text-pink-200 dark:text-pink-100
!bg-rose-50 dark:!bg-rose-950/30 !border-rose-200 dark:!border-rose-950/70 hover:!bg-rose-100 dark:hover:!bg-rose-950/50 text-rose-900 text-rose-950 dark:text-rose-200 dark:text-rose-100
!bg-slate-50 dark:!bg-slate-950/30 !border-slate-200 dark:!border-slate-950/70 hover:!bg-slate-100 dark:hover:!bg-slate-950/50 text-slate-900 text-slate-950 dark:text-slate-200 dark:text-slate-100
!bg-gray-50 dark:!bg-gray-950/30 !border-gray-200 dark:!border-gray-950/70 hover:!bg-gray-100 dark:hover:!bg-gray-950/50 text-gray-900 text-gray-950 dark:text-gray-200 dark:text-gray-100
!bg-zinc-50 dark:!bg-zinc-950/30 !border-zinc-200 dark:!border-zinc-950/70 hover:!bg-zinc-100 dark:hover:!bg-zinc-950/50 text-zinc-900 text-zinc-950 dark:text-zinc-200 dark:text-zinc-100
!bg-neutral-50 dark:!bg-neutral-950/30 !border-neutral-200 dark:!border-neutral-950/70 hover:!bg-neutral-100 dark:hover:!bg-neutral-950/50 text-neutral-900 text-neutral-950 dark:text-neutral-200 dark:text-neutral-100
!bg-stone-50 dark:!bg-stone-950/30 !border-stone-200 dark:!border-stone-950/70 hover:!bg-stone-100 dark:hover:!bg-stone-950/50 text-stone-900 text-stone-950 dark:text-stone-200 dark:text-stone-100
`;

export default ButtonModules
