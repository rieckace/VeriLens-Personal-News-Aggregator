/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearToken, getToken, setToken } from '../services/storage'
import { getMe, loginUser, registerUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)

  async function refresh() {
    try {
      const me = await getMe()
      setUser(me.user)
    } catch {
      setUser(null)
    }
  }

  async function login(email, password) {
    const data = await loginUser({ email, password })
    setToken(data.token)
    setTokenState(data.token)
    setUser(data.user)
    return data
  }

  async function register(name, email, password) {
    const data = await registerUser({ name, email, password })
    setToken(data.token)
    setTokenState(data.token)
    setUser(data.user)
    return data
  }

  function logout() {
    clearToken()
    setTokenState(null)
    setUser(null)
  }

  useEffect(() => {
    let isMounted = true

    async function boot() {
      const t = getToken()
      if (!t) {
        if (isMounted) setIsReady(true)
        return
      }
      try {
        await refresh()
      } finally {
        if (isMounted) setIsReady(true)
      }
    }

    boot()
    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({ token, user, isReady, login, register, logout, refresh }),
    [token, user, isReady]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
