import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl dark:bg-indigo-600/20" />
        <div className="absolute top-40 left-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10" />
      </div>

      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-900">
        <div className="mx-auto max-w-6xl px-4 text-xs text-slate-600 dark:text-slate-500">
          VeriLens-AI-Powered Personalized News Aggregator · Developed by Rieck_Ace.
        </div>
      </footer>
    </div>
  )
}
