export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  testId,
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      <input
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </label>
  )
}
