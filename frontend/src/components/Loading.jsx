export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
