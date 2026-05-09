import { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import { adminApproveSubmission, adminListSubmissions, adminRejectSubmission } from '../services/submissionService'
import { adminSetUserRoleByEmail } from '../services/adminUserService'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

export default function AdminCommunityModerationPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [promoteEmail, setPromoteEmail] = useState('')
  const [promoteBusy, setPromoteBusy] = useState(false)
  const [promoteMsg, setPromoteMsg] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await adminListSubmissions({ status: 'pending' })
      setItems(data.submissions || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load pending submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onApprove(id) {
    if (busyId) return
    setBusyId(id)
    try {
      await adminApproveSubmission(id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to approve submission')
    } finally {
      setBusyId('')
    }
  }

  async function onReject(id) {
    if (busyId) return
    setBusyId(id)
    try {
      await adminRejectSubmission(id, '')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reject submission')
    } finally {
      setBusyId('')
    }
  }

  if (loading) return <Loading label="Loading pending submissions…" />

  return (
    <div className="space-y-6" data-testid="admin-community-page">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Admin • Community moderation</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Approve submissions to publish them in Community.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {items.length ? (
        <div className="grid gap-4">
          {items.map((s) => (
            <div
              key={s._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-900 dark:bg-slate-900/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">{s.title}</div>
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Submitted by {s?.submittedBy?.name || s?.submittedBy?.email || 'User'}
                    {s.createdAt ? <span> • {formatDate(s.createdAt)}</span> : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => onReject(s._id)}
                    disabled={busyId === s._id}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(s._id)}
                    disabled={busyId === s._id}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-70"
                  >
                    Approve
                  </button>
                </div>
              </div>

              {s.description ? (
                <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">{s.description}</p>
              ) : null}

              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Open source
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 dark:border-slate-900 dark:bg-slate-900/30 dark:text-slate-200">
          No pending submissions.
        </div>
      )}

      <div>
        <button
          onClick={load}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-900 dark:bg-slate-900/30">
        <div className="text-lg font-semibold text-slate-900 dark:text-white">Promote user</div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Make a registered user an admin by email.
        </p>

        {promoteMsg ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 dark:border-slate-900 dark:bg-slate-950/30 dark:text-slate-200">
            {promoteMsg}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="user@example.com"
            data-testid="admin-promote-email"
            className="min-w-[260px] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            onClick={async () => {
              if (promoteBusy) return
              setPromoteMsg('')
              const email = promoteEmail.trim()
              if (!email) {
                setPromoteMsg('Email is required')
                return
              }
              setPromoteBusy(true)
              try {
                const data = await adminSetUserRoleByEmail(email, 'admin')
                setPromoteMsg(`Promoted: ${data?.user?.email || email} → admin`)
                setPromoteEmail('')
              } catch (err) {
                setPromoteMsg(err?.response?.data?.message || 'Failed to promote user')
              } finally {
                setPromoteBusy(false)
              }
            }}
            disabled={promoteBusy}
            data-testid="admin-promote-submit"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-70"
          >
            {promoteBusy ? 'Updating…' : 'Make admin'}
          </button>
        </div>
      </div>
    </div>
  )
}
