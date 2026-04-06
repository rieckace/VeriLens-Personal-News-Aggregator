import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { useTheme } from '../context/ThemeContext'
import veriLensLogo from '../assets/verilens-logo.svg'

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      data-testid={`nav-${label.toLowerCase()}`}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm transition ${
          isActive
            ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, token, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    if (!isProfileMenuOpen) return

    function onKeyDown(e) {
      if (e.key === 'Escape') setIsProfileMenuOpen(false)
    }

    function onPointerDown(e) {
      const el = profileMenuRef.current
      if (!el) return
      if (!el.contains(e.target)) setIsProfileMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('touchstart', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('touchstart', onPointerDown)
    }
  }, [isProfileMenuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-900 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          onClick={() => navigate(token ? '/feed' : '/')}
          className="flex items-center gap-2 rounded-xl px-2 py-1 text-left"
        >
          <img
            src={veriLensLogo}
            alt="VeriLens"
            className="h-9 w-9 rounded-xl bg-slate-900/5 p-1 dark:bg-slate-950/30"
            loading="eager"
          />
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">VeriLens</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">See news. Verify signals.</div>
          </div>
        </button>

        {token ? (
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/feed" label="Feed" />
            <NavItem to="/bookmarks" label="Bookmarks" />
            <NavItem to="/history" label="History" />
            <NavItem to="/analytics" label="Analytics" />
            <NavItem to="/preferences" label="Preferences" />
          </nav>
        ) : (
          <div className="hidden md:block text-xs text-slate-400">
            Sign in to personalize your feed
          </div>
        )}

        <div className="flex items-center gap-2">
          {token ? (
            <>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-xl border border-slate-300 bg-white/60 p-2 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900"
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 3v2" />
                    <path d="M12 19v2" />
                    <path d="M5 12H3" />
                    <path d="M21 12h-2" />
                    <path d="M18.364 5.636 16.95 7.05" />
                    <path d="M7.05 16.95 5.636 18.364" />
                    <path d="M18.364 18.364 16.95 16.95" />
                    <path d="M7.05 7.05 5.636 5.636" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
                className="relative rounded-xl border border-slate-300 bg-white/60 p-2 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </button>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  aria-label="Profile menu"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="rounded-xl border border-slate-300 bg-white/60 p-2 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>

                {isProfileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-900 dark:bg-slate-950"
                  >
                    <div className="px-3 py-2">
                      <div className="text-xs text-slate-600 dark:text-slate-400">Profile</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user?.name || user?.email || 'User'}
                      </div>
                      {user?.email ? (
                        <div className="text-xs text-slate-600 dark:text-slate-400">{user.email}</div>
                      ) : null}
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-900" />
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="nav-logout"
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        logout()
                        navigate('/login')
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-xl border border-slate-300 bg-white/60 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:opacity-95"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>

      {token ? (
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <div className="flex flex-wrap gap-1">
            <NavItem to="/feed" label="Feed" />
            <NavItem to="/bookmarks" label="Bookmarks" />
            <NavItem to="/history" label="History" />
            <NavItem to="/analytics" label="Analytics" />
            <NavItem to="/preferences" label="Preferences" />
            <NavItem to="/notifications" label="Notifications" />
          </div>
        </div>
      ) : null}
    </header>
  )
}
