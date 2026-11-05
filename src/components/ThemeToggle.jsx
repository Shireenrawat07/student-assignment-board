import { Moon, Sun } from 'lucide-react'

function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark'

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white/70 px-3 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50 ${className}`}
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
      <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

export default ThemeToggle
