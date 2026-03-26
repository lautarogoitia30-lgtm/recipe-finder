import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Token helpers
  const getAccessToken = () => sessionStorage.getItem(TOKEN_KEY)
  const getRefreshToken = () => sessionStorage.getItem(REFRESH_KEY)

  const setTokens = (access, refresh) => {
    sessionStorage.setItem(TOKEN_KEY, access)
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh)
  }

  const clearTokens = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
  }

  // API call helper with auto-refresh
  const apiCall = useCallback(async (url, options = {}) => {
    const token = getAccessToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    let response = await fetch(url, { ...options, headers })

    // If 401, try to refresh
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        headers.Authorization = `Bearer ${getAccessToken()}`
        response = await fetch(url, { ...options, headers })
      } else {
        logout()
        throw new Error('Session expired. Please login again.')
      }
    }

    return response
  }, [])

  // Refresh token
  const refreshAccessToken = async () => {
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
      const res = await fetch('/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })

      if (!res.ok) {
        clearTokens()
        return false
      }

      const data = await res.json()
      setTokens(data.access, data.refresh)
      return true
    } catch {
      clearTokens()
      return false
    }
  }

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/me/', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        } else {
          // Token expired, try refresh
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            const newToken = getAccessToken()
            const retryRes = await fetch('/api/auth/me/', {
              headers: { Authorization: `Bearer ${newToken}` },
            })
            if (retryRes.ok) {
              const userData = await retryRes.json()
              setUser(userData)
            } else {
              clearTokens()
            }
          } else {
            clearTokens()
          }
        }
      } catch {
        clearTokens()
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  // Login
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setTokens(data.tokens.access, data.tokens.refresh)
    setUser(data.user)
    return data.user
  }

  // Register
  const register = async (email, password) => {
    const res = await fetch('/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      const errorMsg = data.errors?.email?.[0] || data.errors?.password?.[0] || 'Registration failed'
      throw new Error(errorMsg)
    }

    setTokens(data.tokens.access, data.tokens.refresh)
    setUser(data.user)
    return data.user
  }

  // Logout
  const logout = async () => {
    const refresh = getRefreshToken()
    if (refresh) {
      try {
        await fetch('/api/auth/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })
      } catch {
        // Ignore logout errors
      }
    }
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, apiCall, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
