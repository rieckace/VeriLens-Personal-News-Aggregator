export function getSharableUrlForArticle(article) {
  const external = article?.url
  if (external) return external
  if (typeof window === 'undefined') return ''
  if (!article?._id) return window.location.origin
  return new URL(`/articles/${article._id}`, window.location.origin).toString()
}

export async function shareLink({ title, text, url }) {
  const safeUrl = String(url || '').trim()
  if (!safeUrl) throw new Error('Missing URL to share')

  const shareData = {
    title: title || undefined,
    text: text || undefined,
    url: safeUrl,
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(shareData)
      return { method: 'native' }
    } catch (err) {
      // User canceled share dialog
      if (err?.name === 'AbortError') return { method: 'native', aborted: true }
      throw err
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(safeUrl)
    return { method: 'clipboard' }
  }

  // Last-resort fallback
  window.prompt('Copy this link:', safeUrl)
  return { method: 'prompt' }
}
