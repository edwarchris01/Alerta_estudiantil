import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { studentsAPI, riskAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import RiskBadge from '../components/ui/RiskBadge'
import {
  Search,
  ChevronDown,
  Users,
  GraduationCap,
  BookOpen,
  Filter,
  Mail,
  Phone,
  CreditCard,
  ClipboardList,
  ShieldAlert,
  X,
  CalendarClock,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Wallet,
} from 'lucide-react'

const interventionTypes = {
  llamada: 'Llamada telefónica',
  tutoria: 'Tutoría académica',
  remision_psicologia: 'Remisión a psicología',
  entrevista: 'Entrevista personal',
}

const interventionOptions = Object.entries(interventionTypes).map(([value, label]) => ({
  value,
  label,
}))

const buildRecommendations = (student, assessment) => {
  const recommendations = []

  if ((student?.cumulative_gpa ?? 0) < 3.0 || (assessment?.academic_score ?? 0) >= 2) {
    recommendations.push({
      title: 'Tutoría académica prioritaria',
      detail: 'Refuerza hábitos de estudio, materias críticas y seguimiento docente.',
      type: 'tutoria',
      icon: TrendingUp,
      tone: 'emerald',
    })
  }

  if ((student?.absences ?? 0) >= 8) {
    recommendations.push({
      title: 'Seguimiento de asistencia',
      detail: 'Programar llamada o entrevista para validar causas de inasistencia.',
      type: 'llamada',
      icon: AlertCircle,
      tone: 'amber',
    })
  }

  if ((assessment?.economic_score ?? 0) >= 1 || student?.is_scholarship === false) {
    recommendations.push({
      title: 'Orientación financiera y becas',
      detail: 'Revisar apoyos económicos, subsidios o rutas institucionales.',
      type: 'entrevista',
      icon: Wallet,
      tone: 'blue',
    })
  }

  if ((assessment?.emotional_score ?? 0) >= 1) {
    recommendations.push({
      title: 'Acompañamiento emocional',
      detail: 'Considerar remisión a psicología y seguimiento de bienestar.',
      type: 'remision_psicologia',
      icon: Sparkles,
      tone: 'rose',
    })
  }

  if ((assessment?.motivation_score ?? 0) >= 1 || (assessment?.adaptation_score ?? 0) >= 1) {
    recommendations.push({
      title: 'Ruta de adaptación y motivación',
      detail: 'Activar mentoría, entrevista y acompañamiento de permanencia.',
      type: 'entrevista',
      icon: ClipboardList,
      tone: 'violet',
    })
  }

  return recommendations.slice(0, 4)
}

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [programs, setPrograms] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState('')
  const [latestAssessment, setLatestAssessment] = useState(null)
  const [interventions, setInterventions] = useState([])
  const [reassessing, setReassessing] = useState(false)
  const [savingIntervention, setSavingIntervention] = useState(false)
  const [interventionForm, setInterventionForm] = useState({
    type: '',
    description: '',
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [studentsRes, programsRes] = await Promise.all([
        studentsAPI.withDetails(programFilter || undefined),
        studentsAPI.programs(),
      ])
      setStudents(studentsRes.data)
      setPrograms(programsRes.data)
    } catch (err) {
      console.error('Error loading students:', err)
    } finally {
      setLoading(false)
    }
  }, [programFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = students.filter(
    (s) =>
      s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      s.citizen_id?.toLowerCase().includes(search.toLowerCase())
  )

  const averageGpa =
    filtered.length > 0
      ? (
          filtered.reduce((sum, student) => sum + Number(student.cumulative_gpa ?? 0), 0) /
          filtered.length
        ).toFixed(2)
      : '0.00'

  const activePrograms = new Set(
    filtered.map((student) => student.program).filter(Boolean)
  ).size

  const averageSemester =
    filtered.length > 0
      ? (
          filtered.reduce((sum, student) => sum + Number(student.semester ?? 0), 0) /
          filtered.length
        ).toFixed(1)
      : '0.0'

  const getInitials = (name) =>
    (name || 'Estudiante')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'
    return new Date(value).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const applyRecommendation = (type, detail) => {
    setInterventionForm((prev) => ({
      ...prev,
      type,
      description: prev.description?.trim() ? prev.description : detail,
    }))
  }

  const loadTracking = useCallback(async (student) => {
    setTrackingLoading(true)
    setTrackingError('')

    const [assessmentResult, interventionsResult] = await Promise.allSettled([
      riskAPI.getLatest(student.id),
      riskAPI.studentInterventions(student.id),
    ])

    if (assessmentResult.status === 'fulfilled') {
      setLatestAssessment(assessmentResult.value.data)
    } else if (assessmentResult.reason?.response?.status === 404) {
      setLatestAssessment(null)
    } else {
      setTrackingError('No se pudo cargar el riesgo actual del estudiante.')
    }

    if (interventionsResult.status === 'fulfilled') {
      setInterventions(interventionsResult.value.data)
    } else {
      setInterventions([])
      setTrackingError((prev) => prev || 'No se pudo cargar el historial de seguimiento.')
    }

    setTrackingLoading(false)
  }, [])

  const openTracking = async (student) => {
    setSelectedStudent(student)
    setInterventionForm({ type: '', description: '' })
    setLatestAssessment(null)
    setInterventions([])
    await loadTracking(student)
  }

  const closeTracking = () => {
    setSelectedStudent(null)
    setTrackingError('')
    setLatestAssessment(null)
    setInterventions([])
    setInterventionForm({ type: '', description: '' })
  }

  const handleReassess = async () => {
    if (!selectedStudent) return
    setReassessing(true)
    try {
      const res = await riskAPI.assess(selectedStudent.id)
      setLatestAssessment(res.data)
    } catch (err) {
      setTrackingError(err.response?.data?.detail || 'No se pudo recalcular el riesgo.')
    } finally {
      setReassessing(false)
    }
  }

  const handleSaveIntervention = async () => {
    if (!selectedStudent || !latestAssessment || !interventionForm.type || !interventionForm.description.trim()) {
      return
    }

    setSavingIntervention(true)
    try {
      await riskAPI.createIntervention({
        assessment_id: latestAssessment.id,
        action_type: interventionForm.type,
        description: interventionForm.description.trim(),
      })
      setInterventionForm({ type: '', description: '' })
      await loadTracking(selectedStudent)
    } catch (err) {
      setTrackingError(err.response?.data?.detail || 'No se pudo registrar la intervención.')
    } finally {
      setSavingIntervention(false)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando estudiantes…" />

  return (
    <div className="space-y-6 admin-dark-text">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-900 to-primary-700 p-8 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-100">
              <Users className="h-4 w-4" />
              Gestión estudiantil
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Estudiantes registrados</h1>
            <p className="mt-3 text-sm leading-6 text-blue-100/90 md:text-base">
              Consulta rápidamente los perfiles creados desde el portal y revisa programa,
              semestre y datos de contacto en una sola vista.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-blue-100/80">Total</p>
              <p className="mt-2 text-3xl font-bold">{students.length}</p>
              <p className="mt-1 text-xs text-blue-100/75">Registros disponibles</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-blue-100/80">Filtrados</p>
              <p className="mt-2 text-3xl font-bold">{filtered.length}</p>
              <p className="mt-1 text-xs text-blue-100/75">Resultados visibles</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-blue-100/80">Programas</p>
              <p className="mt-2 text-3xl font-bold">{activePrograms}</p>
              <p className="mt-1 text-xs text-blue-100/75">Cobertura actual</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Estudiantes visibles',
            value: filtered.length,
            subtitle: 'Después de aplicar filtros y búsqueda',
            icon: Users,
            color: 'primary',
          },
          {
            title: 'Promedio general',
            value: averageGpa,
            subtitle: 'Promedio acumulado estimado',
            icon: GraduationCap,
            color: 'green',
          },
          {
            title: 'Promedio semestre',
            value: averageSemester,
            subtitle: 'Nivel académico medio del grupo',
            icon: BookOpen,
            color: 'yellow',
          },
          {
            title: 'Programas activos',
            value: activePrograms,
            subtitle: 'Programas presentes en la lista',
            icon: Filter,
            color: 'purple',
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
          >
            <StatCard {...item} />
          </motion.div>
        ))}
      </section>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.42, delay: 0.16 }}
          className="card border-0 shadow-lg shadow-slate-200/70"
        >
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Listado general</h2>
              <p className="text-sm text-gray-500">
                Busca por nombre, código, correo o cédula para localizar un registro.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filtered.length}</span> resultados visibles
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, código, correo o cédula…"
                className="input-field h-12 border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <div className="relative">
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="input-field h-12 min-w-[220px] appearance-none border-slate-200 bg-slate-50 pr-10"
              >
                <option value="">Todos los programas</option>
                {programs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="mb-3 flex items-center justify-between gap-3 px-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Lista con desplazamiento
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  El panel mantiene una altura estable aunque aumenten los registros.
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {filtered.length} estudiantes
              </div>
            </div>

            <div className="max-h-[920px] overflow-y-auto pr-2 custom-scroll space-y-4">
            {filtered.length > 0 ? (
              filtered.map((s, index) => (
                <motion.article
                  key={s.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.03 }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 font-semibold text-primary-700">
                          {getInitials(s.user_name)}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{s.user_name || '—'}</p>
                          <p className="mt-1 font-mono text-xs text-slate-500">{s.student_code}</p>
                          <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <CreditCard className="mr-1 h-3.5 w-3.5" />
                            {s.citizen_id || 'Sin cédula'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Promedio</p>
                          <p className="mt-1 text-xl font-bold text-emerald-800">{(s.cumulative_gpa ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">Perdidas</p>
                          <p className="mt-1 text-xl font-bold text-amber-800">{s.failed_courses}</p>
                        </div>
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-center">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">Inasistencias</p>
                          <p className="mt-1 text-xl font-bold text-rose-800">{s.absences}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contacto</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="break-all">{s.user_email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{s.phone || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Programa</p>
                        <p className="mt-3 text-sm font-semibold text-slate-900">{s.program}</p>
                        <p className="mt-1 text-sm text-slate-600">Semestre {s.semester}</p>
                        <p className="mt-1 text-sm text-slate-600">Ingreso {s.enrollment_year || '—'}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Acción administrativa</p>
                        <p className="mt-3 text-sm text-slate-600">
                          Abre el seguimiento para ver riesgo, historial y registrar acompañamiento.
                        </p>
                        <button
                          onClick={() => openTracking(s)}
                          className="btn-secondary mt-4 inline-flex items-center gap-2 text-sm"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Ver seguimiento
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                    <Users className="h-7 w-7" />
                  </div>
                  <p className="text-base font-semibold text-slate-800">
                    No hay estudiantes para mostrar
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Ajusta los filtros o registra nuevos estudiantes desde el portal público.
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.22 }}
            className="card border-0 bg-slate-900 text-white shadow-xl"
          >
            <h3 className="text-lg font-semibold">Resumen rápido</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Programas disponibles</p>
                <p className="mt-2 text-2xl font-bold">{programs.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Búsqueda activa</p>
                <p className="mt-2 text-sm text-slate-100">
                  {search ? `“${search}”` : 'Sin término de búsqueda'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Filtro actual</p>
                <p className="mt-2 text-sm text-slate-100">
                  {programFilter || 'Todos los programas'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.28 }}
            className="card border-0 shadow-lg shadow-slate-200/70"
          >
            <h3 className="text-lg font-semibold text-slate-900">Vista administrativa</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Esta sección reúne los estudiantes registrados desde el portal para que el equipo
              administrativo tenga una visualización más clara y profesional.
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Contacto completo</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  Correo, celular y cédula en cada fila
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Lectura más clara</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  Indicadores, tarjetas y tabla mejorada
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-blue-600">Nuevo módulo</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  Seguimiento por estudiante con historial de intervenciones
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28 }}
            className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl"
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Seguimiento estudiantil
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">{selectedStudent.user_name}</h2>
                  <p className="mt-2 text-sm text-blue-100/85">
                    {selectedStudent.program} · Semestre {selectedStudent.semester} · {selectedStudent.student_code}
                  </p>
                </div>
                <button
                  onClick={closeTracking}
                  className="rounded-2xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20"
                  aria-label="Cerrar seguimiento"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-100/80">Promedio</p>
                  <p className="mt-2 text-2xl font-bold">{(selectedStudent.cumulative_gpa ?? 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-100/80">Inasistencias</p>
                  <p className="mt-2 text-2xl font-bold">{selectedStudent.absences ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-100/80">Intervenciones</p>
                  <p className="mt-2 text-2xl font-bold">{interventions.length}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 px-6 py-6">
              {trackingError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {trackingError}
                </div>
              ) : null}

              {trackingLoading ? (
                <LoadingSpinner message="Cargando seguimiento…" />
              ) : (
                <>
                  <section className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Estado actual de riesgo
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">
                            Perfil de riesgo del estudiante
                          </h3>
                        </div>
                        {latestAssessment ? <RiskBadge level={latestAssessment.risk_level} /> : null}
                      </div>

                      {latestAssessment ? (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Puntaje total</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{latestAssessment.risk_score}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Método: {latestAssessment.assessment_method}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Última evaluación</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {formatDate(latestAssessment.assessed_at)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Académico {latestAssessment.academic_score} · Económico {latestAssessment.economic_score} · Emocional {latestAssessment.emotional_score}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                          <div className="flex items-start gap-3">
                            <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-500" />
                            <div>
                              <p className="font-semibold text-slate-800">Sin evaluación registrada</p>
                              <p className="mt-1 text-sm text-slate-500">
                                Para iniciar el seguimiento, primero calcula el riesgo actual del estudiante.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-5">
                        <button
                          onClick={handleReassess}
                          disabled={reassessing}
                          className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                          <RefreshCw className={`h-4 w-4 ${reassessing ? 'animate-spin' : ''}`} />
                          {reassessing ? 'Reevaluando…' : latestAssessment ? 'Reevaluar riesgo' : 'Calcular riesgo ahora'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Recomendaciones sugeridas
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        Acciones automáticas para este caso
                      </h3>

                      <div className="mt-5 space-y-3">
                        {buildRecommendations(selectedStudent, latestAssessment).length > 0 ? (
                          buildRecommendations(selectedStudent, latestAssessment).map((item) => {
                            const toneClasses = {
                              emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                              amber: 'border-amber-200 bg-amber-50 text-amber-700',
                              blue: 'border-blue-200 bg-blue-50 text-blue-700',
                              rose: 'border-rose-200 bg-rose-50 text-rose-700',
                              violet: 'border-violet-200 bg-violet-50 text-violet-700',
                            }
                            const Icon = item.icon

                            return (
                              <button
                                key={item.title}
                                type="button"
                                onClick={() => applyRecommendation(item.type, item.detail)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`rounded-2xl border p-2 ${toneClasses[item.tone] || toneClasses.blue}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                                      Click para usar esta sugerencia
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            Aún no hay suficientes señales para sugerir una intervención específica.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Registro de nueva acción
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        Añadir intervención
                      </h3>
                      <div className="mt-5 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Tipo de intervención
                          </label>
                          <select
                            value={interventionForm.type}
                            onChange={(e) => setInterventionForm((prev) => ({ ...prev, type: e.target.value }))}
                            className="input-field bg-white"
                            disabled={!latestAssessment}
                          >
                            <option value="">Selecciona una acción</option>
                            {interventionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Descripción del seguimiento
                          </label>
                          <textarea
                            value={interventionForm.description}
                            onChange={(e) => setInterventionForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="input-field h-32 resize-none bg-white"
                            placeholder="Ej. Se agenda tutoría académica y seguimiento telefónico para la próxima semana."
                            disabled={!latestAssessment}
                          />
                        </div>

                        <button
                          onClick={handleSaveIntervention}
                          disabled={
                            savingIntervention ||
                            !latestAssessment ||
                            !interventionForm.type ||
                            !interventionForm.description.trim()
                          }
                          className="btn-primary w-full inline-flex items-center justify-center gap-2"
                        >
                          <ClipboardList className="h-4 w-4" />
                          {savingIntervention ? 'Guardando seguimiento…' : 'Registrar intervención'}
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Historial cronológico
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          Intervenciones registradas
                        </h3>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {interventions.length} eventos
                      </div>
                    </div>

                    {interventions.length > 0 ? (
                      <div className="mt-6 space-y-4">
                        {interventions.map((item, index) => (
                          <div key={item.id} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            {index !== interventions.length - 1 ? (
                              <div className="absolute left-[1.45rem] top-12 h-[calc(100%+0.5rem)] w-px bg-slate-200" />
                            ) : null}
                            <div className="flex items-start gap-3">
                              <div className="relative z-10 mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                                <ClipboardList className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">
                                      {interventionTypes[item.action_type] || item.action_type}
                                    </h4>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                      {item.description || 'Sin descripción registrada.'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-start gap-2 sm:items-end">
                                    <RiskBadge level={item.risk_level} />
                                    <p className="text-xs text-slate-500">Puntaje {item.risk_score}</p>
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                  <span>
                                    <span className="font-semibold text-slate-700">Responsable:</span> {item.intervener_name}
                                  </span>
                                  <span>
                                    <span className="font-semibold text-slate-700">Intervención:</span> {formatDate(item.created_at)}
                                  </span>
                                  <span>
                                    <span className="font-semibold text-slate-700">Evaluación base:</span> {formatDate(item.assessed_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-4 text-base font-semibold text-slate-800">
                          Aún no hay intervenciones registradas
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Usa el formulario superior para dejar trazabilidad del acompañamiento institucional.
                        </p>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
