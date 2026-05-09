import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { createSubmission } from '../services/submissionService'

export default function SubmitCommunityNewsPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (busy) return

    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setBusy(true)
    try {
      await createSubmission({
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim(),
      })
      navigate('/community?submitted=1')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit news')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6" data-testid="submit-community-page">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Submit to community</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Your post goes to admin for approval before appearing in Community.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-900 dark:bg-slate-900/30"
      >
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <FormField
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Headline for your story"
          testId="submit-title"
        />

        <label className="block">
          <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            data-testid="submit-description"
            placeholder="Short summary (optional)"
            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <FormField
          label="Source URL (optional)"
          value={url}
          onChange={setUrl}
          placeholder="https://..."
          testId="submit-url"
        />

        <FormField
          label="Image URL (optional)"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="https://..."
          testId="submit-image"
        />

        <FormField
          label="Category (optional)"
          value={category}
          onChange={setCategory}
          placeholder="e.g., politics, war"
          testId="submit-category"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            data-testid="submit-submit"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-70"
          >
            {busy ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
