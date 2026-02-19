import { api } from './api'

export async function getPreferences() {
  const { data } = await api.get('/users/preferences')
  return data
}

export async function updatePreferences(preferences) {
  const { data } = await api.put('/users/preferences', { preferences })
  return data
}

export async function getBookmarks() {
  const { data } = await api.get('/users/bookmarks')
  return data
}

export async function getHistory() {
  const { data } = await api.get('/users/history')
  return data
}
