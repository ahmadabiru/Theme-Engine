'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Magnet, Move, Pencil, PinOff, RotateCcw } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export type ModuleId = string

type FreePos = { x: number; y: number }

type Layout = {
  order: ModuleId[]
  free: Record<ModuleId, FreePos>
  opacity?: Record<ModuleId, number>
}

type DragState = {
  id: ModuleId
  offsetX: number
  offsetY: number
  width: number
  height: number
  clientX: number
  clientY: number
  ctrl: boolean
  fromFree: boolean
}

const STORAGE_KEY = 'argentum-layout-v1'

export function DashboardCanvas({
  modules,
}: {
  modules: { id: ModuleId; node: ReactNode }[]
}) {
  const { transparence, setTransparence, setTextColor, getTextColor, theme } = useTheme()
  const defaultOrder = modules.map((m) => m.id)

  const [layout, setLayout] = useState<Layout>({
    order: defaultOrder,
    free: {},
    opacity: Object.fromEntries(defaultOrder.map((id) => [id, 1])),
  })
  const [drag, setDrag] = useState<DragState | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [sideDock, setSideDock] = useState<Record<ModuleId, 'left' | 'right'>>({})

  const canvasRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Map<ModuleId, HTMLDivElement>>(new Map())

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Layout
        const opacity: Record<ModuleId, number> = {}
        for (const id of defaultOrder) {
          const value = parsed.opacity?.[id]
          opacity[id] = typeof value === 'number' ? clamp(value, 0.35, 1) : 1
        }
        // reconcile with current module set
        const known = new Set(defaultOrder)
        const order = parsed.order.filter((id) => known.has(id))
        for (const id of defaultOrder) {
          if (!order.includes(id) && !(parsed.free && parsed.free[id])) {
            order.push(id)
          }
        }
        const free: Record<ModuleId, FreePos> = {}
        for (const id of defaultOrder) {
          if (parsed.free && parsed.free[id]) free[id] = parsed.free[id]
        }
        setLayout({ order, free, opacity })
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    } catch {
      /* ignore */
    }
  }, [layout, hydrated])

  const setSlotRef = useCallback(
    (id: ModuleId) => (el: HTMLDivElement | null) => {
      if (el) slotRefs.current.set(id, el)
      else slotRefs.current.delete(id)
    },
    [],
  )

  const nodeFor = useCallback(
    (id: ModuleId) => modules.find((m) => m.id === id)?.node ?? null,
    [modules],
  )

  // ---- drag mechanics ----
  const computeInsertIndex = useCallback(
    (clientY: number, draggedId: ModuleId) => {
      const docked = layout.order.filter((id) => id !== draggedId)
      let index = docked.length
      for (let i = 0; i < docked.length; i++) {
        const el = slotRefs.current.get(docked[i])
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const mid = rect.top + rect.height / 2
        if (clientY < mid) {
          index = i
          break
        }
      }
      return index
    },
    [layout.order],
  )

  const startDrag = useCallback(
    (e: React.PointerEvent, id: ModuleId) => {
      if (!editMode) return
      e.preventDefault()
      const slot = slotRefs.current.get(id)
      if (!slot) return
      const rect = slot.getBoundingClientRect()
      const fromFree = Boolean(layout.free[id])
      setDrag({
        id,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrl: e.ctrlKey || e.metaKey,
        fromFree,
      })
    },
    [editMode, layout.free],
  )

  useEffect(() => {
    if (!drag) return

    const onMove = (e: PointerEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      setDrag((d) =>
        d ? { ...d, clientX: e.clientX, clientY: e.clientY, ctrl } : d,
      )
      if (ctrl) {
        setInsertIndex(null)
      } else {
        setInsertIndex(computeInsertIndex(e.clientY, drag.id))
      }
    }

    const onUp = (e: PointerEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const canvas = canvasRef.current
      const isSideModule = drag.id === 'tabs' || drag.id === 'omnibox'
      const side = e.clientX < window.innerWidth * 0.2 ? 'left' : e.clientX > window.innerWidth * 0.8 ? 'right' : null
      const edgeSnap = Boolean(isSideModule && side)
      if ((ctrl || edgeSnap) && canvas) {
        // free placement, with edge snapping for vertical browser bars
        const cr = canvas.getBoundingClientRect()
        const rawX = e.clientX - drag.offsetX - cr.left
        const rawY = e.clientY - drag.offsetY - cr.top
        const x = clamp(rawX, 0, Math.max(0, cr.width - drag.width))
        const y = clamp(rawY, 0, Math.max(0, cr.height - drag.height))
        setLayout((prev) => ({
          order: prev.order.filter((id) => id !== drag.id),
          free: { ...prev.free, [drag.id]: { x, y } },
        }))
        if (edgeSnap && side) {
          setSideDock((prev) => ({ ...prev, [drag.id]: side }))
          window.dispatchEvent(new CustomEvent('argentum:orientation', { detail: { id: drag.id, orientation: 'vertical' } }))
          window.dispatchEvent(new CustomEvent('argentum:side-dock', { detail: { side, active: true } }))
        }
      } else {
        // snap into docked stack
        const idx = computeInsertIndex(e.clientY, drag.id)
        setLayout((prev) => {
          const order = prev.order.filter((id) => id !== drag.id)
          order.splice(Math.min(idx, order.length), 0, drag.id)
          const free = { ...prev.free }
          delete free[drag.id]
          return { order, free }
        })
        setSideDock((prev) => {
          const next = { ...prev }
          delete next[drag.id]
          return next
        })
      }
      setDrag(null)
      setInsertIndex(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, computeInsertIndex])

  const redock = useCallback((id: ModuleId) => {
    setLayout((prev) => {
      if (!prev.free[id]) return prev
      const free = { ...prev.free }
      delete free[id]
      return { order: [...prev.order, id], free }
    })
    setSideDock((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const resetLayout = useCallback(() => {
    setLayout({ order: defaultOrder, free: {} })
    setSideDock({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const freeIds = modules.map((m) => m.id).filter((id) => layout.free[id])
  const hasFree = freeIds.length > 0
  const paletteSegments = [
    ['hero-title', 'Hero title'],
    ['hero-date', 'Date'],
    ['hero-time', 'Time'],
    ['logo', 'Logo'],
    ['search', 'Search'],
    ['tabs', 'Tabs'],
    ['url', 'URL bar'],
    ['apps', 'Apps'],
  ] as const
  const setAllOpacity = (value: number) => {
    setLayout((prev) => ({
      ...prev,
      opacity: Object.fromEntries(defaultOrder.map((id) => [id, value])),
    }))
  }

  return (
    <div className="w-full">
      {editMode && (
        <div className="mb-3 flex max-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 overflow-hidden text-[10px] font-medium tracking-wide text-[var(--am-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Move className="h-3.5 w-3.5" /> Drag to rearrange
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Magnet className="h-3.5 w-3.5" /> Snaps into place
          </span>
          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--am-border)] bg-[var(--am-glass)] px-2.5 py-1 text-[var(--am-fg)]">
            <span>Opacity</span>
            <input aria-label="Component opacity" type="range" min="35" max="100" defaultValue="100" onChange={(event) => setAllOpacity(Number(event.target.value) / 100)} className="accent-[var(--am-accent)]" />
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--am-border)] bg-[var(--am-glass)] px-2.5 py-1 text-[var(--am-fg)]">
            <input type="checkbox" checked={transparence} onChange={(event) => setTransparence(event.target.checked)} />
            <span>Transparence</span>
          </label>
          <button type="button" onClick={resetLayout} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--am-border)] bg-[var(--am-glass)] px-2.5 py-1 text-[var(--am-fg)] transition-all duration-300 hover:border-[rgba(var(--am-accent-rgb),0.6)]">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      )}

      {editMode && (
        <div className="mb-3 flex max-h-28 flex-wrap items-center justify-center gap-1.5 overflow-y-auto rounded-2xl border border-[var(--am-border)] bg-[var(--am-surface)] p-2 shadow-xl">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--am-muted)]">Text color</span>
          {paletteSegments.map(([id, label]) => (
            <div key={id} className="flex items-center gap-1 rounded-full border border-[var(--am-border)] px-2 py-1">
              <span className="text-[10px] text-[var(--am-fg)]">{label}</span>
              {(['black', 'white', 'accent'] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`${label}: ${color}`}
                  onClick={() => setTextColor(id, color)}
                  className="size-4 rounded-full border border-[var(--am-border-strong)]"
                  style={{ background: color === 'black' ? '#000' : color === 'white' ? '#fff' : 'var(--am-accent)' }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div
        ref={canvasRef}
        className="relative mx-auto flex min-h-[520px] w-full max-w-2xl flex-col items-center gap-8"
      >
        {/* Docked stack */}
        {layout.order.map((id, i) => {
          const isDragged = drag?.id === id
          return (
            <div key={id} className="w-full">
              {/* insertion indicator */}
              {insertIndex === i && drag && !drag.ctrl && (
                <InsertBar />
              )}
              <div ref={setSlotRef(id)} className="w-full" style={{ opacity: layout.opacity?.[id] ?? 1 }}>
                {isDragged ? (
                  <div
                    aria-hidden="true"
                    style={{ height: drag.height }}
                    className="w-full rounded-2xl border border-dashed border-[rgba(var(--am-accent-rgb),0.4)] bg-[rgba(var(--am-accent-rgb),0.04)]"
                  />
                ) : (
                  <ModuleShell
                    id={id}
                    onHandleDown={startDrag}
                    free={false}
                    editMode={editMode}
                  >
                    {nodeFor(id)}
                  </ModuleShell>
                )}
              </div>
            </div>
          )
        })}
        {/* trailing insertion indicator */}
        {insertIndex === layout.order.filter((id) => id !== drag?.id).length &&
          drag &&
          !drag.ctrl && <InsertBar />}

        {/* Free-floating modules */}
        {freeIds.map((id) => {
          const pos = layout.free[id]
          const isDragged = drag?.id === id
          if (isDragged) {
            // rendered in overlay; keep a ref target for measurements
            return (
              <div
                key={id}
                ref={setSlotRef(id)}
                style={{ position: 'absolute', left: pos.x, top: pos.y }}
                className="pointer-events-none opacity-0"
              />
            )
          }
          return (
            <div
              key={id}
              ref={setSlotRef(id)}
              style={{
                position: sideDock[id] ? 'fixed' : 'absolute',
                left: sideDock[id] === 'left' ? 0 : sideDock[id] ? undefined : pos.x,
                right: sideDock[id] === 'right' ? 0 : undefined,
                top: sideDock[id] ? '50%' : pos.y,
                transform: sideDock[id] ? 'translateY(-50%)' : undefined,
                width: sideDock[id] ? 'clamp(4.5rem, 7vw, 7rem)' : undefined,
              }}
              className={sideDock[id] ? 'z-50 w-28' : 'w-full max-w-md'}
            >
              <ModuleShell
                id={id}
                onHandleDown={startDrag}
                free
                editMode={editMode}
                onRedock={() => redock(id)}
              >
                {nodeFor(id)}
              </ModuleShell>
            </div>
          )
        })}
      </div>

      {editMode && hasFree && (
        <p className="mt-4 text-center text-[11px] text-[var(--am-muted)]">
          Double-click a floating module{`'`}s handle to snap it back.
        </p>
      )}

      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => { setEditMode((value) => { const next = !value; window.dispatchEvent(new CustomEvent('argentum:edit-mode', { detail: { active: next } })); return next }); setDrag(null); setInsertIndex(null) }}
          aria-pressed={editMode}
          aria-label={editMode ? 'Exit edit mode' : 'Edit layout'}
          className="flex size-11 items-center justify-center rounded-full border border-[var(--am-border-strong)] bg-[var(--am-surface)] text-[var(--am-fg)] shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all hover:border-[rgba(var(--am-accent-rgb),0.7)] hover:text-[var(--am-accent)]"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      {editMode && drag && (drag.id === 'tabs' || drag.id === 'omnibox') && (
        <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 flex items-center justify-between px-2 sm:px-4">
          <div className="flex h-3/4 w-16 items-center justify-center rounded-r-2xl border border-dashed border-[rgba(var(--am-accent-rgb),0.55)] bg-[rgba(var(--am-accent-rgb),0.08)] shadow-[0_0_28px_-8px_rgba(var(--am-accent-rgb),0.8)] sm:w-24">
            <span className="text-center text-[10px] uppercase tracking-[0.18em] text-[var(--am-accent)]">Side dock</span>
          </div>
          <div className="flex h-3/4 w-16 items-center justify-center rounded-l-2xl border border-dashed border-[rgba(var(--am-accent-rgb),0.55)] bg-[rgba(var(--am-accent-rgb),0.08)] shadow-[0_0_28px_-8px_rgba(var(--am-accent-rgb),0.8)] sm:w-24">
            <span className="text-center text-[10px] uppercase tracking-[0.18em] text-[var(--am-accent)]">Side dock</span>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {drag && (
        <div
          style={{
            position: 'fixed',
            left: drag.clientX - drag.offsetX,
            top: drag.clientY - drag.offsetY,
            width: drag.width,
            zIndex: 60,
          }}
          className="pointer-events-none"
        >
          <div
            className={[
              'rounded-2xl transition-shadow duration-200',
              drag.ctrl
                ? 'shadow-[0_0_50px_-6px_rgba(var(--am-accent-rgb),0.7)] ring-1 ring-[rgba(var(--am-accent-rgb),0.7)]'
                : 'shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]',
            ].join(' ')}
            style={{ transform: 'scale(1.02) rotate(-0.4deg)' }}
          >
              <ModuleShell id={drag.id} onHandleDown={() => {}} free={drag.ctrl} editMode lifted>
              {nodeFor(drag.id)}
            </ModuleShell>
          </div>
          <div className="mt-2 flex justify-center">
            <span
              className={[
                'rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur-xl',
                drag.ctrl
                  ? 'border-[rgba(var(--am-accent-rgb),0.6)] bg-[rgba(var(--am-accent-rgb),0.12)] text-[var(--am-fg)]'
                  : 'border-[var(--am-border)] bg-[var(--am-glass)] text-[var(--am-muted)]',
              ].join(' ')}
            >
              {drag.ctrl ? 'Free placement' : 'Snapping to grid'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function InsertBar() {
  return (
    <div className="mb-8 flex w-full items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--am-accent)] shadow-[0_0_10px_2px_rgba(var(--am-accent-rgb),0.8)]" />
      <span className="h-px flex-1 bg-gradient-to-r from-[rgba(var(--am-accent-rgb),0.8)] to-transparent" />
    </div>
  )
}

function ModuleShell({
  id,
  children,
  onHandleDown,
  free,
  editMode = false,
  lifted,
  onRedock,
}: {
  id: ModuleId
  children: ReactNode
  onHandleDown: (e: React.PointerEvent, id: ModuleId) => void
  free: boolean
  editMode?: boolean
  lifted?: boolean
  onRedock?: () => void
}) {
  return (
    <div
      className="group/module relative w-full"
      onPointerDown={(e) => {
        if (!editMode) return
        const target = e.target as HTMLElement
        if (target.closest('button, input, textarea, a, select')) return
        onHandleDown(e, id)
      }}
      style={{ touchAction: editMode ? 'none' : undefined }}
    >
      {editMode && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-2xl border border-dashed border-[rgba(var(--am-accent-rgb),0.18)]"
        />
      )}
      {free && onRedock && editMode && (
        <button
          type="button"
          aria-label={`Redock ${id} module`}
          onClick={onRedock}
          className="absolute -right-3 -top-3 z-20 flex size-7 items-center justify-center rounded-full border border-[var(--am-border)] bg-[var(--am-surface)] text-[var(--am-muted)] hover:text-[var(--am-accent)]"
        >
          <PinOff className="size-3.5" />
        </button>
      )}
      <div
        className={[
          'w-full rounded-2xl transition-all duration-300',
          free
            ? 'border border-[var(--am-border)] bg-[var(--am-glass)] p-4 backdrop-blur-xl'
            : '',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}
