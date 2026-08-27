'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { THEMES, type Theme } from '@/lib/themes'

type ThemeContextValue = {
  theme: Theme
  themes: Theme[]
  setThemeId: (id: string) => void
  /** wallpaper image url for the given theme id (or empty string) */
  getWallpaper: (id: string) => string
  /** set/clear the wallpaper url for a theme id */
  setWallpaper: (id: string, url: string) => void
  /** wallpaper for the currently active theme */
  activeWallpaper: string
  transparence: boolean
  setTransparence: (enabled: boolean) => void
  textColors: Record<string, 'black' | 'white' | 'accent'>
  setTextColor: (segment: string, color: 'black' | 'white' | 'accent') => void
  getTextColor: (segment: string) => string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_KEY = 'argentum-theme-v1'
const WALLPAPER_KEY = 'argentum-wallpapers-v1'
const TRANSPARENCE_KEY = 'argentum-transparence-v1'
const TEXT_COLORS_KEY = 'argentum-text-colors-v1'

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(THEMES[0].id)
  const [wallpapers, setWallpapers] = useState<Record<string, string>>({})
  const [transparence, setTransparenceState] = useState(false)
  const [textColors, setTextColors] = useState<Record<string, 'black' | 'white' | 'accent'>>({})

  // hydrate persisted selections
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY)
      if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        setThemeId(savedTheme)
      }
      const savedWalls = localStorage.getItem(WALLPAPER_KEY)
      if (savedWalls) setWallpapers(JSON.parse(savedWalls))
      setTransparenceState(localStorage.getItem(TRANSPARENCE_KEY) === 'true')
      const savedTextColors = localStorage.getItem(TEXT_COLORS_KEY)
      if (savedTextColors) setTextColors(JSON.parse(savedTextColors))
    } catch {
      /* ignore */
    }
  }, [])

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId) ?? THEMES[0],
    [themeId],
  )

  const handleSet = useCallback((id: string) => {
    setThemeId(id)
    try {
      localStorage.setItem(THEME_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const setTransparence = useCallback((enabled: boolean) => {
    setTransparenceState(enabled)
    try { localStorage.setItem(TRANSPARENCE_KEY, String(enabled)) } catch { /* ignore */ }
  }, [])

  const setTextColor = useCallback((segment: string, color: 'black' | 'white' | 'accent') => {
    setTextColors((current) => {
      const next = { ...current, [segment]: color }
      try { localStorage.setItem(TEXT_COLORS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const getWallpaper = useCallback(
    (id: string) => wallpapers[id] ?? '',
    [wallpapers],
  )

  const setWallpaper = useCallback((id: string, url: string) => {
    setWallpapers((prev) => {
      const next = { ...prev }
      if (url.trim()) next[id] = url.trim()
      else delete next[id]
      try {
        localStorage.setItem(WALLPAPER_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const activeWallpaper = wallpapers[theme.id] ?? ''
  const getTextColor = useCallback((segment: string) => {
    const selected = textColors[segment] ?? 'accent'
    return selected === 'black' ? '#000000' : selected === 'white' ? '#ffffff' : theme.accent
  }, [textColors, theme.accent])

  const styleVars = {
    '--am-bg': theme.bg,
    // Keep the dock fully opaque; the theme data intentionally defines the base color.
    '--am-surface': theme.bg,
    '--am-accent': theme.accent,
    '--am-accent-rgb': theme.accentRgb,
    '--am-fg': theme.fg,
    '--am-muted': theme.muted,
    // glass surfaces adapt to light vs dark base
    '--am-glass': theme.light
      ? 'rgba(0, 0, 0, 0.04)'
      : 'rgba(255, 255, 255, 0.04)',
    '--am-glass-strong': theme.light
      ? 'rgba(0, 0, 0, 0.07)'
      : 'rgba(255, 255, 255, 0.07)',
    '--am-border': theme.light
      ? 'rgba(0, 0, 0, 0.10)'
      : 'rgba(255, 255, 255, 0.10)',
    '--am-border-strong': theme.light
      ? 'rgba(0, 0, 0, 0.18)'
      : 'rgba(255, 255, 255, 0.18)',
    '--am-text-hero-title': getTextColor('hero-title'),
    '--am-text-hero-date': getTextColor('hero-date'),
    '--am-text-hero-time': getTextColor('hero-time'),
    '--am-text-logo': getTextColor('logo'),
    '--am-text-search': getTextColor('search'),
    '--am-text-tabs': getTextColor('tabs'),
    '--am-text-url': getTextColor('url'),
    '--am-text-apps': getTextColor('apps'),
  } as CSSProperties

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes: THEMES,
        setThemeId: handleSet,
        getWallpaper,
        setWallpaper,
        activeWallpaper,
        transparence,
        setTransparence,
        textColors,
        setTextColor,
        getTextColor,
      }}
    >
      <div
        style={styleVars}
        className="min-h-screen w-full transition-colors duration-500"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
