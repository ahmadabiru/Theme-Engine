import { ArgentumShell } from '@/components/argentum-shell'
import { ThemeProvider } from '@/components/theme-provider'

export default function Page() {
  return (
    <ThemeProvider>
      <ArgentumShell />
    </ThemeProvider>
  )
}
