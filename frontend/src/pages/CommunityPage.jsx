import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CommunitySubmissionCard from '../components/CommunitySubmissionCard'
import Loading from '../components/Loading'
import { getApprovedSubmissions } from '../services/submissionService'

export default function CommunityPage() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const showSubmittedBanner = searchParams.get('submitted') === '1'

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getApprovedSubmissions()
        if (!mounted) return
        setItems(data.submissions || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load community news')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <Loading label="Loading community news…" />

  return (
    <div className="space-y-6" data-testid="community-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Community news</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Only admin-approved user submissions appear here.
          </p>
        </div>

        <Link
          to="/community/submit"
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-95"
          data-testid="community-submit"
        >
          Submit news
        </Link>
      </div>

      {showSubmittedBanner ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-200">
          Submitted for review. An admin must approve it before it shows up in Community.
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-900 dark:bg-slate-900/30 dark:text-slate-200">
        Any user can submit news, but it is saved as <span className="font-semibold">pending</span> until admin approval.
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {items.length ? (
        <div className="grid gap-4">
          {items.map((s) => (
            <CommunitySubmissionCard key={s._id} submission={s} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 dark:border-slate-900 dark:bg-slate-900/30 dark:text-slate-200">
          No community posts yet.
        </div>
      )}
    </div>
  )
}
