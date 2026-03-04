// src/context/AuthContext.jsx
// EMAIL VERIFICATION: resendVerification commented out until mail service is purchased

import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const _saveUser = (u) => {
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    _saveUser(data.user)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/register', payload)
    localStorage.setItem('token', data.token)
    _saveUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/logout') } catch { }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/me')
    _saveUser(data)
    return data
  }, [])

  // DISABLED: email verification — uncomment when mail service is ready
  // const resendVerification = useCallback(async () => {
  //   await api.post('/email/verification-notification')
  // }, [])

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, refreshUser,
      // resendVerification,  // DISABLED
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}