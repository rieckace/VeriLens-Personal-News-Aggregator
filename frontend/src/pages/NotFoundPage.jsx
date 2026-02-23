import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-900 dark:bg-slate-900/30">
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">Page not found</div>
      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">The page you’re looking for doesn’t exist.</div>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:opacity-95"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
