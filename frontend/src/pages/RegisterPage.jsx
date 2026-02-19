import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/preferences')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-8">
        <h1 className="text-3xl font-semibold text-white">Create your VeriLens account</h1>
        <p className="mt-2 text-slate-300">Pick categories and start reading smarter.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <FormField
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Your name"
            autoComplete="name"
            testId="register-name"
          />
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            testId="register-email"
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            testId="register-password"
          />

          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            data-testid="register-submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Register'}
          </button>

          <div className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-200 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
