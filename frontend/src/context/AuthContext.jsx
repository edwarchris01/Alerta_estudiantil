import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

const IDLE_WARNING_AFTER_MS = 30 * 1000
const WARNING_COUNTDOWN_SECONDS = 30
const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [idleWarning, setIdleWarning] = useState(false)
  const [idleCountdown, setIdleCountdown] = useState(WARNING_COUNTDOWN_SECONDS)

  const idleTimeoutRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const idleWarningRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  const logout = useCallback(() => {
    clearTimers()
    setIdleWarning(false)
    localStorage.removeItem('sigae_token')
    localStorage.removeItem('sigae_user')
    setUser(null)
  }, [clearTimers])

  const startCountdown = useCallback(() => {
    clearTimers()
    setIdleWarning(true)
    setIdleCountdown(WARNING_COUNTDOWN_SECONDS)
    countdownIntervalRef.current = setInterval(() => {
      setIdleCountdown((prev) => {
        if (prev <= 1) {
          clearTimers()
          logout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimers, logout])

  const resetIdleTimer = useCallback(() => {
    if (!user) return
    if (idleWarningRef.current) return
    clearTimers()
    setIdleWarning(false)
    setIdleCountdown(WARNING_COUNTDOWN_SECONDS)
    idleTimeoutRef.current = setTimeout(startCountdown, IDLE_WARNING_AFTER_MS)
  }, [clearTimers, startCountdown, user])

  const continueSession = useCallback(() => {
    if (!user) return
    idleWarningRef.current = false
    setIdleWarning(false)
    setIdleCountdown(WARNING_COUNTDOWN_SECONDS)
    clearTimers()
    idleTimeoutRef.current = setTimeout(startCountdown, IDLE_WARNING_AFTER_MS)
  }, [clearTimers, startCountdown, user])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password)
    const { access_token, user: userData } = res.data
    localStorage.setItem('sigae_token', access_token)
    localStorage.setItem('sigae_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('sigae_token')
    const savedUser = localStorage.getItem('sigae_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      authAPI
        .me()
        .then((res) => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    idleWarningRef.current = idleWarning
  }, [idleWarning])

  useEffect(() => {
    if (!user) {
      clearTimers()
      setIdleWarning(false)
      setIdleCountdown(WARNING_COUNTDOWN_SECONDS)
      return undefined
    }

    const handleActivity = () => {
      resetIdleTimer()
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })

    resetIdleTimer()

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
      clearTimers()
    }
  }, [clearTimers, resetIdleTimer, user])

  const isStaff =
    user && ['admin', 'coordinador', 'bienestar'].includes(user.role)

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isStaff,
        idleWarning,
        idleCountdown,
        continueSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
