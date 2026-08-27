'use client'

import { CommandSearch } from '@/components/command-search'
import { DashboardCanvas } from '@/components/dashboard-canvas'
import { HeroSection } from '@/components/hero-section'
import { QuickLaunch } from '@/components/quick-launch'
import { TabBar } from '@/components/tab-bar'
import { UrlBar } from '@/components/url-bar'
import { WidgetDock } from '@/components/widget-dock'
import { useTheme } from '@/components/theme-provider'
import { useEffect, useState } from 'react'

type Side = 'left' | 'right'

export function ArgentumShell() {
  const { activeWallpaper, transparence } = useTheme()
  const [rails, setRails] = useState<{ left: boolean; right: boolean }>({ left: false, right: false })

  useEffect(() => {
    const onDock = (event: Event) => {
      const detail = (event as CustomEvent<{ side?: Side; active?: boolean }>).detail
      if (!detail?.side) return
      setRails((current) => ({ ...current, [detail.side as Side]: detail.active !== false }))
    }
    window.addEventListener('argentum:side-dock', onDock)
    return () => window.removeEventListener('argentum:side-dock', onDock)
  }, [])

  const contentInset = rails.left && rails.right ? 'px-24 sm:px-28 lg:px-32' : rails.left || rails.right ? 'px-20 sm:px-24 lg:px-28' : ''

  return (
    <main
      className={`relative flex min-h-screen w-full flex-col overflow-visible transition-colors duration-500 ${transparence ? 'transparence' : ''}`}
      style={{ background: 'var(--am-bg)' }}
    >
      {/* optional per-theme wallpaper */}
      {activeWallpaper && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeWallpaper})` }}
        />
      )}

      {/* ambient accent glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(600px circle at 15% 0%, rgba(var(--am-accent-rgb),0.16), transparent 45%), radial-gradient(700px circle at 90% 110%, rgba(var(--am-accent-rgb),0.12), transparent 50%)',
        }}
      />

      {/* Fully modular content — everything is drag & drop */}
      <div className={`relative z-10 flex-1 pb-10 pt-8 transition-[padding] duration-300 ${contentInset || 'px-4 sm:px-8 lg:px-12'}`}>
        <DashboardCanvas
          modules={[
            { id: 'hero', node: <HeroSection /> },
            { id: 'search', node: <CommandSearch /> },
            { id: 'quick-launch', node: <QuickLaunch /> },
            { id: 'dock', node: <WidgetDock /> },
          ]}
        />
      </div>
    </main>
  )
}
