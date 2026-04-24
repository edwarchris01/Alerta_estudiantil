import { useState, useEffect } from 'react'
import { riskAPI } from '../services/api'
import RiskBadge from '../components/ui/RiskBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  AlertTriangle,
  Phone,
  BookOpen,
  Heart,
  MessageSquare,
} from 'lucide-react'

const interventionTypes = [
  { value: 'llamada', label: 'Llamada telefónica', icon: Phone },
  { value: 'tutoria', label: 'Tutoría académica', icon: BookOpen },
  { value: 'remision_psicologia', label: 'Remisión a psicología', icon: Heart },
  { value: 'entrevista', label: 'Entrevista personal', icon: MessageSquare },
]

export default function AlertsPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [intervention, setIntervention] = useState({
    type: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    riskAPI
      .dashboard()
      .then((res) => setDashboard(res.data))
      .catch(() => setError('No se pudieron cargar las alertas. Intente de nuevo.'))
      .finally(() => setLoading(false))
  }, [])

  const handleIntervention = async () => {
    if (!selectedAlert || !intervention.type) return
    setSaving(true)
    try {
      const assessment = await riskAPI.getLatest(selectedAlert.student_id)
      await riskAPI.createIntervention({
        assessment_id: assessment.data.id,
        action_type: intervention.type,
        description: intervention.description,
      })
      alert('Intervención registrada exitosamente')
      setSelectedAlert(null)
      setIntervention({ type: '', description: '' })
      // Recargar el dashboard para reflejar la intervención registrada
      riskAPI.dashboard().then((res) => setDashboard(res.data)).catch(() => {})
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando alertas…" />

  if (error)
    return (
      <div className="card text-center py-12">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    )

  const alerts = dashboard?.recent_alerts || []

  return (
    <div className="space-y-6 admin-dark-text">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Alertas de Riesgo
          </h1>
          <p className="text-gray-500 dark:text-slate-300 text-sm mt-1">
            Estudiantes que requieren intervención inmediata
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-slate-300">
            No hay alertas de riesgo alto o crítico actualmente
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((a) => (
            <div
              key={a.student_id}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {a.student_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {a.student_code} · {a.program} · Semestre {a.semester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <RiskBadge level={a.risk_level} />
                    <p className="text-xs text-gray-400 mt-1">
                      Puntaje: {a.risk_score}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(a)}
                    className="btn-primary text-sm"
                  >
                    Intervenir
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <span className="text-xs text-gray-500 dark:text-slate-300">
                  Factor principal:{' '}
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">
                  {a.top_factor}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intervention Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
              Registrar Intervención
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-300 mb-6">
              Estudiante: {selectedAlert.student_name}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Tipo de intervención
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interventionTypes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        setIntervention((prev) => ({
                          ...prev,
                          type: t.value,
                        }))
                      }
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-all ${
                        intervention.type === t.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-500'
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                  Descripción
                </label>
                <textarea
                  value={intervention.description}
                  onChange={(e) =>
                    setIntervention((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input-field h-24 resize-none"
                  placeholder="Detalle de la intervención realizada…"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedAlert(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleIntervention}
                disabled={saving || !intervention.type}
                className="btn-primary flex-1"
              >
                {saving ? 'Guardando…' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
