import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

export default function AdminRoute({ children }) {
  const { token, user, isReady } = useAuth()

  if (!isReady) return <Loading label="Checking session…" />
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/feed" replace />

  return children
}
