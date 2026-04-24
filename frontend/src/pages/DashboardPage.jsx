import { useState } from 'react'
import { motion } from 'motion/react'
import { useDashboard } from '../hooks/useDashboard'
import { riskAPI } from '../services/api'
import StatCard from '../components/ui/StatCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart'
import RiskByProgramChart from '../components/dashboard/RiskByProgramChart'
import RiskBySemesterChart from '../components/dashboard/RiskBySemesterChart'
import TopFactorsChart from '../components/dashboard/TopFactorsChart'
import AlertsTable from '../components/dashboard/AlertsTable'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Activity,
} from 'lucide-react'

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard()
  const [assessing, setAssessing] = useState(false)

  const handleReassess = async () => {
    setAssessing(true)
    try {
      await riskAPI.assessAll()
      await refresh()
    } catch (err) {
      alert('Error al reevaluar: ' + (err.response?.data?.detail || err.message))
    } finally {
      setAssessing(false)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando dashboard…" />
  if (error)
    return <div className="text-red-500 p-8 text-center">{error}</div>
  if (!data) return null

  const riskPercentage =
    data.total_students > 0
      ? ((data.students_at_risk / data.total_students) * 100).toFixed(1)
      : 0

  return (
    <div className="space-y-6 admin-dark-text">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Dashboard Institucional
          </h1>
          <p className="text-gray-500 dark:text-slate-300 text-sm mt-1">
            Visión general del estado de riesgo estudiantil
          </p>
        </div>
        <button
          onClick={handleReassess}
          disabled={assessing}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${assessing ? 'animate-spin' : ''}`}
          />
          {assessing ? 'Evaluando…' : 'Reevaluar Todos'}
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Estudiantes',
            value: data.total_students,
            icon: Users,
            color: 'primary',
          },
          {
            title: 'En Riesgo',
            value: data.students_at_risk,
            subtitle: `${riskPercentage}% del total`,
            icon: AlertTriangle,
            color: 'red',
          },
          {
            title: 'Riesgo Alto/Crítico',
            value:
              (data.risk_distribution.alto || 0) +
              (data.risk_distribution.critico || 0),
            icon: Activity,
            color: 'yellow',
          },
          {
            title: 'Bajo Riesgo',
            value: data.risk_distribution.bajo || 0,
            icon: TrendingUp,
            color: 'green',
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
          >
            <StatCard {...item} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
          <RiskDistributionChart distribution={data.risk_distribution} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
          <TopFactorsChart data={data.top_risk_factors} />
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.24 }}>
          <RiskByProgramChart data={data.risk_by_program} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <RiskBySemesterChart data={data.risk_by_semester} />
        </motion.div>
      </div>

      {/* Alerts Table */}
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.36 }}>
        <AlertsTable alerts={data.recent_alerts} />
      </motion.div>
    </div>
  )
}
