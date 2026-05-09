import { api } from './api'

export async function getApprovedSubmissions() {
  const { data } = await api.get('/submissions')
  return data
}

export async function createSubmission(payload) {
  const { data } = await api.post('/submissions', payload)
  return data
}

export async function adminListSubmissions({ status = 'pending' } = {}) {
  const { data } = await api.get('/admin/submissions', { params: { status } })
  return data
}

export async function adminApproveSubmission(id) {
  const { data } = await api.post(`/admin/submissions/${id}/approve`)
  return data
}

export async function adminRejectSubmission(id, note) {
  const { data } = await api.post(`/admin/submissions/${id}/reject`, { note })
  return data
}
