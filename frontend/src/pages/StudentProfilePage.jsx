/**
 * StudentProfilePage — Datos personales y académicos del estudiante
 * Permite al estudiante actualizar su información y recalcular su riesgo.
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentsAPI, riskAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  User,
  GraduationCap,
  BookOpen,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BadgeCheck,
  Mail,
  Hash,
  Calendar,
} from 'lucide-react'

const PROGRAMS = [
  'Ingeniería de Sistemas',
  'Medicina',
  'Derecho',
  'Psicología',
  'Administración de Empresas',
  'Enfermería',
  'Fisioterapia',
  'Contaduría Pública',
]

function Field({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {Icon && <Icon className="inline w-3.5 h-3.5 mr-1 text-gray-400" />}
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function ReadOnly({ value }) {
  return (
    <div className="input-field bg-gray-50 text-gray-600 cursor-default select-all">
      {value || '—'}
    </div>
  )
}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', message }

  // Form state
  const [form, setForm] = useState({
    program: '',
    semester: 1,
    cumulative_gpa: 0,
    failed_courses: 0,
    absences: 0,
    repeated_courses: 0,
    is_scholarship: false,
  })

  useEffect(() => {
    studentsAPI
      .me()
      .then((res) => {
        const p = res.data
        setProfile(p)
        setForm({
          program: p.program,
          semester: p.semester,
          cumulative_gpa: p.cumulative_gpa,
          failed_courses: p.failed_courses,
          absences: p.absences,
          repeated_courses: p.repeated_courses,
          is_scholarship: p.is_scholarship,
        })
      })
      .catch(() => setFeedback({ type: 'error', message: 'No se encontró tu perfil académico.' }))
      .finally(() => setLoading(false))
  }, [])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const updated = await studentsAPI.updateMe(form)
      setProfile(updated.data)
      setFeedback({ type: 'success', message: 'Datos guardados correctamente.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al guardar los datos.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRecalculate = async () => {
    if (!profile) return
    setRecalculating(true)
    setFeedback(null)
    try {
      await studentsAPI.updateMe(form)
      await riskAPI.assessMe()
      setFeedback({ type: 'success', message: 'Riesgo recalculado. Ve a Inicio para ver tu nuevo resultado.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Error al recalcular el riesgo.',
      })
    } finally {
      setRecalculating(false)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando tu perfil…" />

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-slate-950 admin-dark-text">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Mis datos personales</h1>
          <p className="text-gray-500 dark:text-slate-300 text-sm mt-1">
            Mantén tu información actualizada para que podamos apoyarte de la mejor manera.
          </p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            {feedback.message}
          </div>
        )}

        {/* ── Sección 1: Información institucional ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Información institucional</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Estos datos son asignados por la institución y no pueden modificarse aquí.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" icon={User}>
              <ReadOnly value={user?.full_name} />
            </Field>
            <Field label="Correo institucional" icon={Mail}>
              <ReadOnly value={user?.email} />
            </Field>
            <Field label="Código estudiantil" icon={Hash}>
              <ReadOnly value={profile?.student_code} />
            </Field>
            <Field label="Año de matrícula" icon={Calendar}>
              <ReadOnly value={profile?.enrollment_year} />
            </Field>
          </div>
        </div>

        {/* ── Sección 2: Datos académicos ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Datos académicos</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Ingresa tu situación académica actual con la mayor exactitud posible.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Programa académico" icon={BookOpen} hint="Carrera que cursas actualmente">
              <select
                value={form.program}
                onChange={(e) => set('program', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
              >
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="Semestre actual" hint="Entre 1 y 10">
              <input
                type="number"
                min={1}
                max={10}
                value={form.semester}
                onChange={(e) => set('semester', parseInt(e.target.value) || 1)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
              />
            </Field>

            <Field label="Promedio acumulado (GPA)" hint="Escala de 0.0 a 5.0">
              <input
                type="number"
                min={0}
                max={5}
                step={0.01}
                value={form.cumulative_gpa}
                onChange={(e) => set('cumulative_gpa', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
              />
            </Field>

            <Field label="Materias reprobadas" hint="Total de materias que no aprobaste">
              <input
                type="number"
                min={0}
                value={form.failed_courses}
                onChange={(e) => set('failed_courses', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
              />
            </Field>

            <Field label="Inasistencias (días)" hint="Número de días de ausencia en el semestre">
              <input
                type="number"
                min={0}
                value={form.absences}
                onChange={(e) => set('absences', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
              />
            </Field>

            <Field label="Materias repetidas" hint="Materias que has cursado más de una vez">
              <input
                type="number"
                min={0}
                value={form.repeated_courses}
                onChange={(e) => set('repeated_courses', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
              />
            </Field>
          </div>

          {/* Scholarship checkbox */}
          <label className="flex items-start gap-3 mt-5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.is_scholarship}
              onChange={(e) => set('is_scholarship', e.target.checked)}
              className="mt-1 w-4 h-4 accent-primary-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-sm text-gray-800">
                  Soy beneficiario/a de beca o subsidio
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Marca esta casilla si actualmente cuentas con algún tipo de apoyo económico institucional.
              </p>
            </div>
          </label>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={handleSave}
            disabled={saving || recalculating}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar datos
              </>
            )}
          </button>

          <button
            onClick={handleRecalculate}
            disabled={saving || recalculating}
            className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {recalculating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recalculando…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Guardar y recalcular riesgo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
