'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronUp,
  ImageIcon,
  Palette,
  Pencil,
  Timer,
  Trash2,
} from 'lucide-react'
import { useTheme } from './theme-provider'
import WallpaperSuggestions from './wallpaper-suggestions'

export function WidgetDock() {
  const { theme, themes, setThemeId, getWallpaper, setWallpaper } = useTheme()
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftUrl, setDraftUrl] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setEditingId(null)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const startEditing = (id: string) => {
    setDraftUrl(getWallpaper(id))
    setEditingId((cur) => (cur === id ? null : id))
  }

  const saveWallpaper = (id: string) => {
    setWallpaper(id, draftUrl)
    setEditingId(null)
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1.5 rounded-full border border-[var(--am-border-strong)] bg-[var(--am-surface)] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        {/* Theme switcher pill */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Switch theme"
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-[var(--am-fg)] transition-all duration-300 hover:bg-[var(--am-glass-strong)]"
          >
            <Palette className="h-4 w-4 text-[var(--am-muted)]" />
            <span>{theme.name}</span>
            <ChevronUp
              className={`h-3.5 w-3.5 text-[var(--am-muted)] transition-transform duration-300 ${
                open ? '' : 'rotate-180'
              }`}
            />
          </button>

          {open && (
            <div
              className="absolute bottom-[calc(100%+10px)] left-1/2 w-72 -translate-x-1/2 rounded-2xl border border-[var(--am-border-strong)] p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)]"
              style={{ background: 'var(--am-surface)' }}
            >
              {themes.map((t) => {
                const active = t.id === theme.id
                const hasWall = Boolean(getWallpaper(t.id))
                const isEditing = editingId === t.id
                return (
                  <div key={t.id}>
                    <div
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 ${
                        active
                          ? 'bg-[var(--am-glass)] text-[var(--am-fg)]'
                          : 'text-[var(--am-muted)] hover:bg-[var(--am-glass)] hover:text-[var(--am-fg)]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span
                          aria-hidden="true"
                          className="relative h-5 w-8 shrink-0 overflow-hidden rounded-md border border-[var(--am-border-strong)] shadow-inner"
                          style={{ backgroundColor: t.bg }}
                        >
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-tl-md"
                            style={{ backgroundColor: t.accent }}
                          />
                        </span>
                        <span className="flex-1 truncate">{t.name}</span>
                        {hasWall && (
                          <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[var(--am-accent)]" />
                        )}
                        {active && (
                          <Check className="h-4 w-4 shrink-0 text-[var(--am-accent)]" />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label={`Set wallpaper for ${t.name}`}
                        title={`Set a wallpaper for ${t.name}`}
                        onClick={() => startEditing(t.id)}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                          isEditing
                            ? 'bg-[var(--am-accent)] text-[var(--am-bg)]'
                            : 'text-[var(--am-muted)] hover:bg-[var(--am-glass-strong)] hover:text-[var(--am-accent)]'
                        }`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isEditing && (
                      <div className="flex flex-col gap-2 px-2 pb-2 pt-1">
                        <WallpaperSuggestions
                          themeId={t.id}
                          onSelect={(url) => {
                            setWallpaper(t.id, url)
                            setDraftUrl(url)
                          }}
                        />
                        <div className="flex items-center gap-1.5">
                        <input
                          value={draftUrl}
                          onChange={(e) => setDraftUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                              saveWallpaper(t.id)
                            }
                          }}
                          placeholder="Paste image URL…"
                          aria-label={`Wallpaper URL for ${t.name}`}
                          className="min-w-0 flex-1 rounded-lg border border-[var(--am-border)] bg-[var(--am-glass)] px-2.5 py-1.5 text-xs text-[var(--am-fg)] outline-none placeholder:text-[var(--am-muted)] focus:border-[rgba(var(--am-accent-rgb),0.6)]"
                        />
                        <button
                          type="button"
                          onClick={() => saveWallpaper(t.id)}
                          aria-label="Save wallpaper"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--am-accent)] text-[var(--am-bg)] transition-opacity hover:opacity-90"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        {getWallpaper(t.id) && (
                          <button
                            type="button"
                            onClick={() => {
                              setWallpaper(t.id, '')
                              setDraftUrl('')
                              setEditingId(null)
                            }}
                            aria-label="Remove wallpaper"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--am-border)] text-[var(--am-muted)] transition-colors hover:text-[var(--am-fg)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <p className="px-3 py-2 text-[11px] leading-relaxed text-[var(--am-muted)]">
                Click the pencil to set a wallpaper per theme — paste any image
                URL. It saves in this browser.
              </p>
            </div>
          )}
        </div>

        <span className="h-5 w-px bg-[var(--am-border)]" />

        {/* Focus timer toggle */}
        <button
          type="button"
          onClick={() => setFocus((v) => !v)}
          aria-pressed={focus}
          aria-label="Toggle focus timer"
          className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
            focus
              ? 'bg-[var(--am-accent)] text-[var(--am-bg)] shadow-[0_0_16px_rgba(var(--am-accent-rgb),0.6)]'
              : 'text-[var(--am-muted)] hover:bg-[var(--am-glass-strong)] hover:text-[var(--am-fg)]'
          }`}
        >
          <Timer className="h-4 w-4" />
          <span className="hidden sm:inline">{focus ? '25:00' : 'Focus'}</span>
        </button>
      </div>
    </div>
  )
}
