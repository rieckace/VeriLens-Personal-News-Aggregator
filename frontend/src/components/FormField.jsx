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
      <div className="mb-1 text-sm font-medium text-slate-200">{label}</div>
      <input
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none ring-indigo-500/30 focus:ring-4"
      />
    </label>
  )
}
