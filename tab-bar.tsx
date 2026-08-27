'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Columns2, Rows3 } from 'lucide-react'
import { ArgentumMark } from './argentum-mark'

type Orientation = 'horizontal' | 'vertical'

type Tab = {
  id: string
  label: string
  /** url used to resolve a favicon; internal pages use the Argentum mark */
  url?: string
  internal?: boolean
}

const DEFAULT_TABS: Tab[] = [
  { id: 'newtab', label: 'New Tab', internal: true },
  { id: 'docs', label: 'Docs · Argentum', url: 'https://vercel.com' },
  { id: 'github', label: 'GitHub', url: 'https://github.com' },
]

const ORIENT_KEY = 'argentum-tabbar-orientation-v1'

function faviconFor(url?: string) {
  if (!url) return ''
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  } catch {
    return ''
  }
}

export function TabBar() {
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [tabs, setTabs] = useState<Tab[]>(DEFAULT_TABS)
  const [activeId, setActiveId] = useState('newtab')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORIENT_KEY) as Orientation | null
      if (saved === 'horizontal' || saved === 'vertical') setOrientation(saved)
    } catch {
      /* ignore */
    }
    const onOrientation = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string; orientation?: Orientation }>).detail
      if (detail?.id === 'tabs' && detail.orientation === 'vertical') setOrientation('vertical')
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

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (id === activeId && next.length) setActiveId(next[0].id)
      return next
    })
  }

  const addTab = () => {
    const id = `tab-${Date.now()}`
    setTabs((prev) => [...prev, { id, label: 'New Tab', internal: true }])
    setActiveId(id)
  }

  const vertical = orientation === 'vertical'

  return (
    <div
      className={[
        'flex w-full gap-2',
        vertical ? 'flex-col items-center' : 'flex-row items-center',
      ].join(' ')}
    >
      {/* orientation toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch tabs to ${vertical ? 'horizontal' : 'vertical'}`}
        title={`Switch to ${vertical ? 'horizontal' : 'vertical'} tabs`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--am-border)] bg-[var(--am-glass)] text-[var(--am-muted)] transition-all duration-300 hover:border-[rgba(var(--am-accent-rgb),0.5)] hover:text-[var(--am-accent)]"
      >
        {vertical ? (
          <Columns2 className="h-4 w-4" />
        ) : (
          <Rows3 className="h-4 w-4" />
        )}
      </button>

      {/* tabs */}
      <div
        className={[
          'flex flex-1 gap-1.5 overflow-hidden',
          vertical
            ? 'flex-col items-center'
            : 'flex-row items-center overflow-x-auto',
        ].join(' ')}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId
          const favicon = faviconFor(tab.url)

          // vertical → favicon-only circle
          if (vertical) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                aria-label={tab.label}
                title={tab.label}
                className={[
                  'group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                  active
                    ? 'border-[rgba(var(--am-accent-rgb),0.7)] bg-[var(--am-glass-strong)] shadow-[0_0_16px_-2px_rgba(var(--am-accent-rgb),0.6)]'
                    : 'border-[var(--am-border)] bg-[var(--am-glass)] hover:border-[rgba(var(--am-accent-rgb),0.4)]',
                ].join(' ')}
              >
                {tab.internal || !favicon ? (
                  <ArgentumMark size={18} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={favicon || '/placeholder.svg'}
                    alt=""
                    width={18}
                    height={18}
                    referrerPolicy="no-referrer"
                    className="h-[18px] w-[18px] rounded-sm"
                  />
                )}
                {active && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--am-accent)] shadow-[0_0_8px_1px_rgba(var(--am-accent-rgb),0.9)]" />
                )}
              </button>
            )
          }

          // horizontal → labelled pill
          return (
            <div
              key={tab.id}
              className={[
                'group flex h-9 max-w-[180px] shrink-0 items-center gap-2 rounded-xl px-3 text-[13px] transition-all duration-300',
                active
                  ? 'border border-[var(--am-border)] bg-[var(--am-glass-strong)] text-[var(--am-fg)] shadow-[0_-2px_20px_-4px_rgba(var(--am-accent-rgb),0.35)]'
                  : 'border border-transparent text-[var(--am-muted)] hover:bg-[var(--am-glass)] hover:text-[var(--am-fg)]',
              ].join(' ')}
            >
              {tab.internal || !favicon ? (
                <span className="grid h-4 w-4 shrink-0 place-items-center">
                  <ArgentumMark size={13} />
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={favicon || '/placeholder.svg'}
                  alt=""
                  width={14}
                  height={14}
                  referrerPolicy="no-referrer"
                  className="h-3.5 w-3.5 shrink-0 rounded-sm"
                />
              )}
              <button
                type="button"
                onClick={() => setActiveId(tab.id)}
                className="min-w-0 flex-1 truncate text-left"
              >
                {tab.label}
              </button>
              <button
                type="button"
                aria-label={`Close ${tab.label}`}
                onClick={() => closeTab(tab.id)}
                className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-60 hover:!opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          aria-label="New tab"
          onClick={addTab}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--am-muted)] transition-all duration-300 hover:bg-[var(--am-glass)] hover:text-[var(--am-fg)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
