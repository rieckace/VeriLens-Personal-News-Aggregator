import { api } from './api'

export async function adminSetUserRoleByEmail(email, role) {
  const { data } = await api.post('/admin/users/set-role', { email, role })
  return data
}
