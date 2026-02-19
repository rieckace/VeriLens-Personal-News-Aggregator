const map = {
  positive: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  negative: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  neutral: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
  left: 'bg-purple-500/15 text-purple-200 border-purple-500/30',
  right: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  center: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
}

export default function Badge({ tone = 'neutral', children }) {
  const cls = map[tone] || map.neutral
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  )
}
