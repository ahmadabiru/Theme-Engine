'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Pencil, Plus, X } from 'lucide-react'

type Shortcut = { id: string; label: string; url: string }
const KEY = 'argentum-shortcuts-v1'
const DEFAULTS: Shortcut[] = [
  { id: 'github', label: 'GitHub', url: 'https://github.com' },
  { id: 'figma', label: 'Figma', url: 'https://figma.com' },
  { id: 'youtube', label: 'YouTube', url: 'https://youtube.com' },
  { id: 'x', label: 'X', url: 'https://x.com' },
]

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function QuickLaunch() {
  const [items, setItems] = useState<Shortcut[]>(DEFAULTS)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    const onEditMode = (event: Event) => setEditing(Boolean((event as CustomEvent<{ active?: boolean }>).detail?.active))
    window.addEventListener('argentum:edit-mode', onEditMode)
    return () => window.removeEventListener('argentum:edit-mode', onEditMode)
  }, [])

  const save = (next: Shortcut[]) => {
    setItems(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }
  const add = () => {
    const label = window.prompt('App name')
    const url = window.prompt('Website URL', 'https://')
    if (label && url) save([...items, { id: crypto.randomUUID(), label, url: normalizeUrl(url) }])
  }
  const edit = (item: Shortcut) => {
    const label = window.prompt('App name', item.label)
    const url = window.prompt('Website URL', item.url)
    if (label && url) save(items.map((entry) => entry.id === item.id ? { ...entry, label, url: normalizeUrl(url) } : entry))
  }

  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="group relative flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl border border-[var(--am-border)] bg-[var(--am-glass)] p-3 backdrop-blur-xl">
          <a href={normalizeUrl(item.url)} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2.5" aria-label={`Open ${item.label}`}>
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--am-glass-strong)] text-[var(--am-accent)]"><ExternalLink className="size-5" /></span>
            <span className="max-w-full truncate text-xs font-medium text-[var(--am-muted)]">{item.label}</span>
          </a>
          {editing && <div className="absolute right-2 top-2 flex gap-1"><button type="button" onClick={() => edit(item)} aria-label={`Edit ${item.label}`}><Pencil className="size-3.5" /></button><button type="button" onClick={() => save(items.filter((entry) => entry.id !== item.id))} aria-label={`Remove ${item.label}`}><X className="size-3.5" /></button></div>}
        </div>
      ))}
      {editing && (
        <button
          type="button"
          onClick={add}
          aria-label="Add app"
          className="group/add flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(var(--am-accent-rgb),0.55)] bg-[rgba(var(--am-accent-rgb),0.05)] text-[var(--am-muted)] transition-all hover:border-[var(--am-accent)] hover:bg-[rgba(var(--am-accent-rgb),0.1)] hover:text-[var(--am-accent)]"
        >
          <span className="flex size-11 items-center justify-center rounded-xl border border-dashed border-[rgba(var(--am-accent-rgb),0.65)] bg-[rgba(var(--am-accent-rgb),0.08)] transition-transform group-hover/add:scale-105">
            <Plus className="size-5" />
          </span>
          <span className="text-xs font-medium">Add app</span>
        </button>
      )}
      {editing && <button type="button" onClick={() => setEditing(false)} className="col-span-full text-xs text-[var(--am-muted)]">Done editing apps</button>}
    </div>
  )
}
