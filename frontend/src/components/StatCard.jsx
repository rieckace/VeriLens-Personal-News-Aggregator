export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}
