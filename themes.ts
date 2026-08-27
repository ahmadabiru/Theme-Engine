export type Theme = {
  id: string
  name: string
  /** main background hex */
  bg: string
  /** accent hex */
  accent: string
  /** accent as "r, g, b" for rgba() glows */
  accentRgb: string
  /** primary text color */
  fg: string
  /** muted text color */
  muted: string
  /** whether the base background is light (affects glass tint) */
  light?: boolean
}

export const THEMES: Theme[] = [
  {
    id: 'silver',
    name: 'Argentum Default',
    bg: '#0A0A0A',
    accent: '#E2E8F0',
    accentRgb: '226, 232, 240',
    fg: '#F5F5F5',
    muted: '#8A8A8A',
  },
  {
    id: 'pink',
    name: 'Born Pink',
    bg: '#0D0D0D',
    accent: '#FF007F',
    accentRgb: '255, 0, 127',
    fg: '#F5F5F5',
    muted: '#8A8A8A',
  },
  {
    id: 'acid',
    name: 'Chemical X',
    bg: '#080808',
    accent: '#B0FF00',
    accentRgb: '176, 255, 0',
    fg: '#F5F5F5',
    muted: '#8A8A8A',
  },
  {
    id: 'teal',
    name: 'Going Ghost',
    bg: '#0F4C5C',
    accent: '#FFFFFF',
    accentRgb: '255, 255, 255',
    fg: '#F5FBFC',
    muted: '#9FC4CC',
  },
  {
    id: 'purple',
    name: 'The Jester',
    bg: '#2A085C',
    accent: '#CCFF00',
    accentRgb: '204, 255, 0',
    fg: '#F7F2FF',
    muted: '#B49FD6',
  },
  {
    id: 'banana',
    name: 'Banana Split',
    bg: '#FFE135',
    accent: '#FF69B4',
    accentRgb: '255, 105, 180',
    fg: '#1A1A0D',
    muted: '#6E6636',
    light: true,
  },
  {
    id: 'cyan',
    name: 'Electric',
    bg: '#050505',
    accent: '#00F0FF',
    accentRgb: '0, 240, 255',
    fg: '#F5F5F5',
    muted: '#8A8A8A',
  },
]
