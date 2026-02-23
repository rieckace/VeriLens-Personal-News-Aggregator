import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/preferences')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-900 dark:bg-slate-900/30">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Welcome back to VeriLens</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Sign in to get a personalized feed with sentiment, bias and analytics.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            testId="login-email"
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            testId="login-password"
          />

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            data-testid="login-submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>

          <div className="text-center text-sm text-slate-400">
            New here?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:underline dark:text-slate-200">
              Create an account
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-8 dark:border-slate-900 dark:from-slate-900/40 dark:to-slate-950">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-900 dark:bg-slate-950/40">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">What you get</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">A smarter daily news experience</div>
          <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
              Personalized feed from your categories
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
              Sentiment scoring (positive / neutral / negative)
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
              Bias indicator + fake probability (basic scoring)
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
              Reading history, bookmarks, analytics dashboard
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-900 dark:bg-slate-900/30">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tip</div>
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            If you don’t have a NewsAPI key yet, the backend will still run using mock articles.
          </div>
        </div>
      </div>
    </div>
  )
}
