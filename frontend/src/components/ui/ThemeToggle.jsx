import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'sigae_theme'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved ? saved === 'dark' : prefersDark
    setIsDark(initial)
    document.documentElement.classList.toggle('dark', initial)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
      aria-label="Alternar modo oscuro"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? 'Claro' : 'Oscuro'}
    </button>
  )
}
