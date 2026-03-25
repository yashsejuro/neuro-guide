import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="ng-theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="ng-theme-toggle-track">
        <Sun className={`ng-theme-icon ${theme === 'light' ? 'ng-theme-icon-active' : ''}`} />
        <Moon className={`ng-theme-icon ${theme === 'dark' ? 'ng-theme-icon-active' : ''}`} />
        <div className={`ng-theme-thumb ${theme === 'dark' ? 'ng-theme-thumb-dark' : ''}`} />
      </div>
    </button>
  )
}
