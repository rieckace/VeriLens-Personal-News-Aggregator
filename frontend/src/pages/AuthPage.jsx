import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={`${className} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}

function FieldIcon({ kind }) {
  if (kind === 'user') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }

  if (kind === 'lock') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M22 6 12 13 2 6" />
      <path d="M2 6v12h20V6" />
    </svg>
  )
}

function EyeButton({ pressed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={pressed ? 'Hide password' : 'Show password'}
      className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
    >
      {pressed ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
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
          aria-hidden="true"
        >
          <path d="M10.733 5.076A10.744 10.744 0 0 1 12 5c7 0 10 7 10 7a18.13 18.13 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      )}
    </button>
  )
}

function AuthInput({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  icon,
  error,
  testId,
  right,
}) {
  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <FieldIcon kind={icon} />
        </span>
        <input
          data-testid={testId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder=" "
          className={`peer w-full rounded-2xl border bg-white/60 px-11 pb-2.5 pt-5 text-slate-900 outline-none transition focus:ring-4 dark:bg-slate-950/30 dark:text-slate-100 ${
            error
              ? 'border-rose-300 focus:ring-rose-500/20 dark:border-rose-500/40'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20 dark:border-slate-900 dark:focus:border-indigo-500'
          }`}
        />
        <label
          className={`pointer-events-none absolute left-11 top-3 text-sm text-slate-600 transition-all peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-slate-900 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs dark:text-slate-300 dark:peer-focus:text-white`}
        >
          <span className="rounded px-1 bg-slate-50/80 dark:bg-slate-950/70">{label}</span>
        </label>
        {right ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div> : null}
      </div>
      {error ? <div className="mt-1 text-xs text-rose-600 dark:text-rose-300">{error}</div> : null}
    </div>
  )
}

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const routeMode = useMemo(
    () => (location.pathname === '/register' ? 'register' : 'login'),
    [location.pathname]
  )
  const [mode, setMode] = useState(routeMode)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMode(routeMode)
    setError('')
    setFieldErrors({})
  }, [routeMode])

  function go(next) {
    if (next === 'register') navigate('/register', { replace: true })
    else navigate('/login', { replace: true })
  }

  async function submitLogin(e) {
    e.preventDefault()
    setError('')

    const nextErrors = {}
    if (!loginEmail.trim()) nextErrors.loginEmail = 'Email is required'
    else if (!validateEmail(loginEmail.trim())) nextErrors.loginEmail = 'Enter a valid email'
    if (!loginPassword) nextErrors.loginPassword = 'Password is required'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await login(loginEmail.trim(), loginPassword, rememberMe)
      navigate('/preferences')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function submitRegister(e) {
    e.preventDefault()
    setError('')

    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Full name is required'
    if (!email.trim()) nextErrors.email = 'Email is required'
    else if (!validateEmail(email.trim())) nextErrors.email = 'Enter a valid email'

    if (!password) nextErrors.password = 'Password is required'
    else if (password.length < 6) nextErrors.password = 'Use at least 6 characters'

    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your password'
    else if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid items-stretch gap-8 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="h-full rounded-3xl border border-slate-200 bg-gradient-to-br from-white/60 to-slate-100/60 p-10 backdrop-blur dark:border-slate-900 dark:from-slate-950/40 dark:to-slate-900/20">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-900 dark:bg-slate-950/30 dark:text-slate-300">
            VeriLens
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            Personalized News
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            See news. Verify signals.
          </h1>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300">
            A clean, modern reading experience with sentiment, bias, and analytics—tailored to the topics you care about.
          </p>

          <div className="mt-10 grid gap-4">
            {[
              { title: 'Smart feed', desc: 'Personalized categories + fast browsing' },
              { title: 'Signals', desc: 'Sentiment score + basic bias indicators' },
              { title: 'Insights', desc: 'Bookmarks, history, and analytics dashboard' },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white/60 p-5 dark:border-slate-900 dark:bg-slate-950/30"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.title}</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white/60 p-5 text-sm text-slate-600 dark:border-slate-900 dark:bg-slate-950/30 dark:text-slate-400">
            Tip: You can run the backend with mock articles if needed.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white/60 p-8 shadow-sm backdrop-blur dark:border-slate-900 dark:bg-slate-950/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {mode === 'login'
                    ? 'Sign in to personalize your feed.'
                    : 'Join VeriLens to start reading smarter.'}
                </p>
              </div>
              <div className="hidden sm:block text-right text-xs text-slate-500 dark:text-slate-400">
                Secure · Fast · Minimal
              </div>
            </div>

            <div className="mt-6">
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-900 dark:bg-slate-950/40">
                <div
                  className="absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm transition-transform duration-300 dark:bg-slate-900"
                  style={{ transform: mode === 'login' ? 'translateX(0%)' : 'translateX(100%)' }}
                />
                <div className="relative grid grid-cols-2">
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      mode === 'login'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => go('register')}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      mode === 'register'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="mt-6 overflow-hidden">
              <div
                className="flex w-[200%] transition-transform duration-300 ease-out"
                style={{ transform: mode === 'login' ? 'translateX(0%)' : 'translateX(-50%)' }}
              >
                <div className="w-1/2 pr-3">
                  <form onSubmit={submitLogin} className="space-y-4" aria-hidden={mode !== 'login'} inert={mode !== 'login'}>
                    <AuthInput
                      label="Email"
                      icon="email"
                      type="email"
                      value={loginEmail}
                      onChange={setLoginEmail}
                      autoComplete="email"
                      error={fieldErrors.loginEmail}
                      testId={mode === 'login' ? 'login-email' : undefined}
                    />

                    <AuthInput
                      label="Password"
                      icon="lock"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={setLoginPassword}
                      autoComplete="current-password"
                      error={fieldErrors.loginPassword}
                      testId={mode === 'login' ? 'login-password' : undefined}
                      right={
                        <EyeButton
                          pressed={showLoginPassword}
                          onClick={() => setShowLoginPassword((v) => !v)}
                        />
                      }
                    />

                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 dark:border-slate-700"
                        />
                        Remember me
                      </label>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-sm font-semibold text-slate-700 hover:underline dark:text-slate-200"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <button
                      disabled={loading}
                      data-testid={mode === 'login' ? 'login-submit' : undefined}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-60"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {loading ? <Spinner /> : null}
                        {loading ? 'Signing in…' : 'Login'}
                      </span>
                    </button>

                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                      New here?{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-slate-900 hover:underline dark:text-slate-200"
                      >
                        Create an account
                      </Link>
                    </div>
                  </form>
                </div>

                <div className="w-1/2 pl-3">
                  <form
                    onSubmit={submitRegister}
                    className="space-y-4"
                    aria-hidden={mode !== 'register'}
                    inert={mode !== 'register'}
                  >
                    <AuthInput
                      label="Full Name"
                      icon="user"
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                      error={fieldErrors.name}
                      testId={mode === 'register' ? 'register-name' : undefined}
                    />

                    <AuthInput
                      label="Email"
                      icon="email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      error={fieldErrors.email}
                      testId={mode === 'register' ? 'register-email' : undefined}
                    />

                    <AuthInput
                      label="Password"
                      icon="lock"
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                      error={fieldErrors.password}
                      testId={mode === 'register' ? 'register-password' : undefined}
                      right={
                        <EyeButton
                          pressed={showRegisterPassword}
                          onClick={() => setShowRegisterPassword((v) => !v)}
                        />
                      }
                    />

                    <AuthInput
                      label="Confirm Password"
                      icon="lock"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                      error={fieldErrors.confirmPassword}
                      testId={mode === 'register' ? 'register-confirm-password' : undefined}
                      right={
                        <EyeButton
                          pressed={showConfirmPassword}
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        />
                      }
                    />

                    <button
                      disabled={loading}
                      data-testid={mode === 'register' ? 'register-submit' : undefined}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-60"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {loading ? <Spinner /> : null}
                        {loading ? 'Creating…' : 'Register'}
                      </span>
                    </button>

                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="font-semibold text-slate-900 hover:underline dark:text-slate-200"
                      >
                        Login
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            By continuing, you agree to use VeriLens responsibly.
          </div>
        </div>
      </div>
    </div>
  )
}
