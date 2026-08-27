'use client'

import { Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function CommandSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [aiMode, setAiMode] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="w-full">
      <div className="group relative flex h-16 items-center gap-4 rounded-2xl border border-[var(--am-border)] bg-[var(--am-glass)] px-5 backdrop-blur-xl transition-all duration-300 hover:border-[rgba(var(--am-accent-rgb),0.4)] focus-within:border-[rgba(var(--am-accent-rgb),0.7)] focus-within:shadow-[0_0_25px_rgba(var(--am-accent-rgb),0.35)]">
        <Search className="h-5 w-5 shrink-0 text-[var(--am-muted)] transition-colors duration-300 group-focus-within:text-[var(--am-accent)]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search the web or type a command..."
          aria-label="Command search"
          className="min-w-0 flex-1 bg-transparent text-base text-[var(--am-fg)] outline-none placeholder:text-[var(--am-muted)]"
        />

        {/* AI Mode toggle */}
        <button
          type="button"
          onClick={() => setAiMode((v) => !v)}
          aria-pressed={aiMode}
          className={[
            'hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 sm:flex',
            aiMode
              ? 'border-transparent bg-[var(--am-accent)] text-[var(--am-bg)] shadow-[0_0_16px_rgba(var(--am-accent-rgb),0.6)]'
              : 'border-[var(--am-border)] text-[var(--am-muted)] hover:text-[var(--am-fg)]',
          ].join(' ')}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Mode
        </button>

        {/* shortcut badge */}
        <kbd className="hidden items-center gap-1 rounded-lg border border-[var(--am-border)] bg-[var(--am-glass-strong)] px-2 py-1 font-sans text-xs font-medium text-[var(--am-muted)] sm:flex">
          ⌘K
        </kbd>
      </div>
    </div>
  )
}
