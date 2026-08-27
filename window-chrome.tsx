'use client'

import { Plus, ShieldCheck, Star, RotateCw, X } from 'lucide-react'
import { ArgentumMark } from './argentum-mark'

const TABS = [
  { label: 'New Tab', active: true },
  { label: 'Docs · Argentum', active: false },
  { label: 'GitHub', active: false },
]

export function WindowChrome() {
  return (
    <header className="w-full">
      {/* Tab strip */}
      <div className="flex items-center gap-2 px-3 pt-3">
        {/* traffic lights */}
        <div className="mr-2 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--am-fg)]/20" />
          <span className="h-3 w-3 rounded-full bg-[var(--am-fg)]/20" />
          <span className="h-3 w-3 rounded-full bg-[var(--am-fg)]/20" />
        </div>

        <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
          {TABS.map((tab) => (
            <div
              key={tab.label}
              className={[
                'group flex h-9 max-w-[180px] items-center gap-2 rounded-t-xl border-b-0 px-3.5 text-[13px] transition-all duration-300',
                tab.active
                  ? 'border border-[var(--am-border)] bg-[var(--am-glass-strong)] text-[var(--am-fg)] shadow-[0_-2px_20px_-4px_rgba(var(--am-accent-rgb),0.35)]'
                  : 'border border-transparent text-[var(--am-muted)] hover:bg-[var(--am-glass)] hover:text-[var(--am-fg)]',
              ].join(' ')}
            >
              {tab.active && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--am-accent)] shadow-[0_0_10px_2px_rgba(var(--am-accent-rgb),0.8)]" />
              )}
              <span className="truncate">{tab.label}</span>
              <X className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-60" />
            </div>
          ))}
          <button
            type="button"
            aria-label="New tab"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--am-muted)] transition-all duration-300 hover:bg-[var(--am-glass)] hover:text-[var(--am-fg)]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Omnibox row */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <ArgentumMark size={22} className="ml-1 shrink-0" />
        <div className="group flex h-11 flex-1 items-center gap-3 rounded-full border border-[var(--am-border)] bg-[var(--am-glass)] px-4 backdrop-blur-xl transition-all duration-300 focus-within:border-[rgba(var(--am-accent-rgb),0.6)] focus-within:shadow-[0_0_20px_-2px_rgba(var(--am-accent-rgb),0.35)]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--am-accent)]" />
          <input
            defaultValue="argentum://newtab"
            aria-label="Address bar"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--am-fg)] outline-none placeholder:text-[var(--am-muted)]"
          />
          {/* subtle loading indicator */}
          <span className="relative h-4 w-4 shrink-0">
            <span className="absolute inset-0 rounded-full border border-[var(--am-fg)]/15" />
            <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-[var(--am-accent)]" />
          </span>
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
    </header>
  )
}
