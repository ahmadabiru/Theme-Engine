'use client'

import { useEffect, useState } from 'react'
import {
  RotateCw,
  ShieldCheck,
  Star,
  Columns2,
  Rows3,
} from 'lucide-react'
import { ArgentumMark } from './argentum-mark'

type Orientation = 'horizontal' | 'vertical'

const ORIENT_KEY = 'argentum-urlbar-orientation-v1'

export function UrlBar() {
  const [orientation, setOrientation] = useState<Orientation>('horizontal')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORIENT_KEY) as Orientation | null
      if (saved === 'horizontal' || saved === 'vertical') setOrientation(saved)
    } catch {
      /* ignore */
    }
    const onOrientation = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string; orientation?: Orientation }>).detail
      if (detail?.id === 'omnibox' && detail.orientation === 'vertical') setOrientation('vertical')
    }
    window.addEventListener('argentum:orientation', onOrientation)
    return () => window.removeEventListener('argentum:orientation', onOrientation)
  }, [])

  const toggle = () => {
    setOrientation((o) => {
      const next = o === 'horizontal' ? 'vertical' : 'horizontal'
      try {
        localStorage.setItem(ORIENT_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const vertical = orientation === 'vertical'

  return (
    <div
      className={[
        'flex w-full gap-2',
        vertical ? 'flex-col items-center' : 'flex-row items-center',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch address bar to ${vertical ? 'horizontal' : 'vertical'}`}
        title={`Switch to ${vertical ? 'horizontal' : 'vertical'} address bar`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--am-border)] bg-[var(--am-glass)] text-[var(--am-muted)] transition-all duration-300 hover:border-[rgba(var(--am-accent-rgb),0.5)] hover:text-[var(--am-accent)]"
      >
        {vertical ? (
          <Columns2 className="h-4 w-4" />
        ) : (
          <Rows3 className="h-4 w-4" />
        )}
      </button>

      <ArgentumMark size={22} className="shrink-0" />

      <div
        className={[
          'group flex flex-1 items-center gap-3 rounded-full border border-[var(--am-border)] bg-[var(--am-glass)] px-4 backdrop-blur-xl transition-all duration-300 focus-within:border-[rgba(var(--am-accent-rgb),0.6)] focus-within:shadow-[0_0_20px_-2px_rgba(var(--am-accent-rgb),0.35)]',
          vertical ? 'h-11 w-full min-w-0' : 'h-11',
        ].join(' ')}
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--am-accent)]" />
        <input
          defaultValue="argentum://newtab"
          aria-label="Address bar"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--am-fg)] outline-none placeholder:text-[var(--am-muted)]"
        />
        <Star className="h-4 w-4 shrink-0 text-[var(--am-muted)] transition-colors duration-300 hover:text-[var(--am-accent)]" />
      </div>

      <button
        type="button"
        aria-label="Reload"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--am-muted)] transition-all duration-300 hover:bg-[var(--am-glass)] hover:text-[var(--am-fg)]"
      >
        <RotateCw className="h-4 w-4" />
      </button>
    </div>
  )
}
