import { useState, useEffect, useCallback } from 'react'
import { riskAPI } from '../services/api'

export function useDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await riskAPI.dashboard()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { data, loading, error, refresh: fetchDashboard }
}
