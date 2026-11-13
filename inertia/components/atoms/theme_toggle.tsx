import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { usePage } from '@inertiajs/react'

const THEME_COOKIE = 'app_theme'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export default function ThemeToggle() {
  const page = usePage()
  const [theme, setTheme] = useState<'light' | 'dark'>(page.props.preferences?.theme ?? 'light')

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    document.cookie = `${THEME_COOKIE}=${nextTheme}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`
  }

  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="iconbtn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Sun size={16} className={`themetoggle__icon ${isDark ? 'themetoggle__icon--on' : ''}`} />
      <Moon size={16} className={`themetoggle__icon ${isDark ? '' : 'themetoggle__icon--on'}`} />
    </button>
  )
}
