'use client'

import { useEffect, useState } from 'react'
import { ArgentumMark } from './argentum-mark'

export function HeroSection() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now
    ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--'
  const date = now
    ? now.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <section className="flex flex-col items-center text-center">
      {/* Emblem with radial glow */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute h-40 w-40 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(var(--am-accent-rgb),0.45) 0%, transparent 70%)',
          }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--am-border)] bg-[var(--am-glass)] backdrop-blur-xl" style={{ color: 'var(--am-text-logo)' }}>
          <ArgentumMark size={40} />
        </div>
      </div>

      {/* Wordmark */}
      <h1 className="mt-6 text-2xl font-bold tracking-[0.5em] sm:text-3xl" style={{ color: 'var(--am-text-hero-title)' }}>
        <span className="pl-[0.5em]">ARGENTUM</span>
      </h1>

      {/* Date */}
      <p className="mt-6 text-sm font-medium uppercase tracking-[0.25em]" style={{ color: 'var(--am-text-hero-date)' }}>
        {date}
      </p>

      {/* Time */}
      <div
        className="text-7xl font-bold leading-none tracking-tight tabular-nums sm:text-8xl"
        style={{
          textShadow: '0 0 40px rgba(var(--am-accent-rgb),0.25)',
        }}
      >
        {time}
      </div>
    </section>
  )
}
