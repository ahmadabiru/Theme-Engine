'use client'

import { useEffect, useState } from 'react'
import { getWallpaperSuggestions, trackSelection, type WallpaperPhoto } from '../lib/wallpaper-sources'
import './wallpaper-suggestions.css'

type WallpaperSuggestionsProps = {
  themeId: string
  onSelect?: (url: string, photo: WallpaperPhoto) => void
}

export default function WallpaperSuggestions({ themeId, onSelect }: WallpaperSuggestionsProps) {
  const [photos, setPhotos] = useState<WallpaperPhoto[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [pending, setPending] = useState<WallpaperPhoto | null>(null)
  const [zoom, setZoom] = useState(100)
  const [position, setPosition] = useState(50)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getWallpaperSuggestions(themeId).then((results) => {
      if (cancelled) return
      setPhotos(results)
      setStatus(results.length ? 'ready' : 'error')
    }).catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [themeId])

  const openCrop = (photo: WallpaperPhoto) => {
    setPending(photo)
    setZoom(100)
    setPosition(50)
  }

  const applyCrop = () => {
    if (!pending) return
    const separator = pending.fullUrl.includes('?') ? '&' : '?'
    const url = `${pending.fullUrl}${separator}crop=entropy&fit=crop&fm=jpg&q=85&ixlib=rb-4.1.0&fp-x=${position / 100}&fp-y=0.5&fp-z=${zoom / 100}`
    onSelect?.(url, pending)
    trackSelection(pending)
    setPending(null)
  }

  if (status === 'loading') return <div className="wp-suggestions wp-suggestions--loading">Loading suggestions…</div>
  if (status === 'error') return <div className="wp-suggestions wp-suggestions--error">Couldn&apos;t load suggestions right now. Check your API keys or try again.</div>

  return (
    <>
      <div className="wp-suggestions">
        <div className="wp-suggestions__grid">
          {photos.map((photo) => (
            <button key={photo.id} className="wp-card" onClick={() => openCrop(photo)} title={`Photo by ${photo.photographer} on ${capitalize(photo.source)}`}>
              <img src={photo.thumbUrl} alt="" loading="lazy" />
              <span className="wp-card__credit">{photo.photographer} · {capitalize(photo.source)}</span>
            </button>
          ))}
        </div>
      </div>
      {pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Resize wallpaper">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-[var(--am-border-strong)] bg-[var(--am-surface)] p-4 text-[var(--am-fg)] shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Resize wallpaper</h2><button type="button" onClick={() => setPending(null)} className="text-xs text-[var(--am-muted)]">Cancel</button></div>
            <div className="h-44 overflow-hidden rounded-xl border border-[var(--am-border)] bg-[var(--am-glass)]">
              <img src={pending.fullUrl} alt="Wallpaper preview" className="h-full w-full object-cover" style={{ objectPosition: `${position}% 50%`, transform: `scale(${zoom / 100})` }} />
            </div>
            <label className="flex flex-col gap-1 text-xs">Zoom <input aria-label="Wallpaper zoom" type="range" min="100" max="220" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></label>
            <label className="flex flex-col gap-1 text-xs">Horizontal position <input aria-label="Wallpaper position" type="range" min="0" max="100" value={position} onChange={(e) => setPosition(Number(e.target.value))} /></label>
            <button type="button" onClick={applyCrop} className="rounded-xl bg-[var(--am-accent)] px-3 py-2 text-sm font-medium text-[var(--am-bg)]">Use wallpaper</button>
          </div>
        </div>
      )}
    </>
  )
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
