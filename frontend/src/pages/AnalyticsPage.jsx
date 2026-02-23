import { useEffect, useMemo, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js'
import Loading from '../components/Loading'
import StatCard from '../components/StatCard'
import { getAnalytics } from '../services/analyticsService'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function AnalyticsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const axisTickColor = isDark ? '#cbd5e1' : '#334155'
  const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.08)'
  const legendColor = axisTickColor

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const a = await getAnalytics()
        if (!mounted) return
        setData(a)
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load analytics')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const categoryChart = useMemo(() => {
    const entries = Object.entries(data?.categoryPreference || {})
    const labels = entries.map(([k]) => k)
    const values = entries.map(([, v]) => v)

    return {
      labels,
      datasets: [
        {
          label: 'Reads',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.35)',
          borderColor: 'rgba(99, 102, 241, 0.8)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    }
  }, [data])

  const sentimentChart = useMemo(() => {
    const s = data?.sentimentDistribution || { positive: 0, neutral: 0, negative: 0 }
    return {
      labels: ['positive', 'neutral', 'negative'],
      datasets: [
        {
          data: [s.positive || 0, s.neutral || 0, s.negative || 0],
          backgroundColor: [
            'rgba(16, 185, 129, 0.35)',
            'rgba(148, 163, 184, 0.35)',
            'rgba(244, 63, 94, 0.35)',
          ],
          borderColor: ['rgba(16, 185, 129, 0.7)', 'rgba(148, 163, 184, 0.7)', 'rgba(244, 63, 94, 0.7)'],
          borderWidth: 1,
        },
      ],
    }
  }, [data])

  if (loading) return <Loading label="Loading analytics…" />

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-900/30">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Analytics dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">A snapshot of your reading behavior.</p>
        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {data ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total reads" value={data.totalArticlesRead ?? 0} />
          <StatCard label="Bookmarks" value={data.bookmarkCount ?? 0} />
          <StatCard label="Most read category" value={data.mostReadCategory || '—'} />
          <StatCard label="Articles in DB" value={data.totalArticlesInDb ?? 0} />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-900/30">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Category preference</div>
          <div className="mt-4">
            <Bar
              data={categoryChart}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: axisTickColor }, grid: { color: gridColor } },
                  y: { ticks: { color: axisTickColor }, grid: { color: gridColor } },
                },
              }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-900/30">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Sentiment distribution</div>
          <div className="mt-4">
            <Pie
              data={sentimentChart}
              options={{
                plugins: {
                  legend: { labels: { color: legendColor } },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-900/30">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">Reading frequency (last 7 days)</div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {(data?.readingFrequencyLast7Days || []).map((v, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-900 dark:bg-slate-950/20"
            >
              <div className="text-xs text-slate-600 dark:text-slate-500">{idx}d</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
