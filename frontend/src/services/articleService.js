import { api } from './api'

export async function refreshArticles() {
  const { data } = await api.post('/articles/refresh')
  return data
}

export async function getFeed(params) {
  const { data } = await api.get('/articles/feed', { params })
  return data
}

export async function getArticleById(id) {
  const { data } = await api.get(`/articles/${id}`)
  return data
}

export async function markRead(id) {
  const { data } = await api.post(`/articles/${id}/read`)
  return data
}

export async function addBookmark(id) {
  const { data } = await api.post(`/articles/${id}/bookmark`)
  return data
}

export async function removeBookmark(id) {
  const { data } = await api.delete(`/articles/${id}/bookmark`)
  return data
}
