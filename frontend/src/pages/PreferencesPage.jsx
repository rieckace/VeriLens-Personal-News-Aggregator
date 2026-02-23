import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../constants/categories'
import Loading from '../components/Loading'
import { getPreferences, updatePreferences } from '../services/userService'
import { useAuth } from '../context/AuthContext'

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`pref-${String(children)}`}
      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-100 dark:hover:bg-indigo-500/20'
          : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function PreferencesPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const all = useMemo(() => CATEGORIES, [])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getPreferences()
        if (mounted) setSelected(data.preferences || [])
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  function toggle(cat) {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
    )
  }

  async function onSave() {
    setError('')
    setSaving(true)
    try {
      await updatePreferences(selected)
      await refresh()
      navigate('/feed')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading label="Loading preferences…" />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-900 dark:bg-slate-900/30">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your preferences</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Select the categories you want to see more often.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {all.map((c) => (
            <Pill key={c} active={selected.includes(c)} onClick={() => toggle(c)}>
              {c}
            </Pill>
          ))}
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Selected:{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-200">{selected.length}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected(['technology', 'business', 'science'])}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Quick set
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              data-testid="preferences-save"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save & continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
