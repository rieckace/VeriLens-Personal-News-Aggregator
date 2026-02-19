import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import veriLensLogo from '../assets/verilens-logo.svg'

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      data-testid={`nav-${label.toLowerCase()}`}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm transition ${
          isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-900 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          onClick={() => navigate(token ? '/feed' : '/')}
          className="flex items-center gap-2 rounded-xl px-2 py-1 text-left"
        >
          <img
            src={veriLensLogo}
            alt="VeriLens"
            className="h-9 w-9 rounded-xl bg-slate-950/30 p-1"
            loading="eager"
          />
          <div>
            <div className="text-sm font-semibold text-white">VeriLens</div>
            <div className="text-xs text-slate-400">See news. Verify signals.</div>
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
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-400">Signed in as</div>
                <div className="text-sm font-medium text-slate-100">
                  {user?.name || user?.email || 'User'}
                </div>
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                data-testid="nav-logout"
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900"
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
          </div>
        </div>
      ) : null}
    </header>
  )
}
