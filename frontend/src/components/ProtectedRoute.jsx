import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

export default function ProtectedRoute({ children }) {
  const { token, isReady } = useAuth()

  if (!isReady) return <Loading label="Checking session…" />
  if (!token) return <Navigate to="/login" replace />

  return children
}
