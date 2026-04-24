/**
 * StudentPortalPage — Inicio del estudiante
 * Muestra el estado de riesgo, resumen académico y accesos rápidos.
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { studentsAPI, riskAPI, surveysAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  GraduationCap,
  Home,
  ClipboardList,
  User,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Heart,
  DollarSign,
  Lightbulb,
  Users2,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'

// ── Helpers de riesgo ─────────────────────────────────────────
const riskConfig = {
  bajo: {
    label: 'Riesgo Bajo',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    bar: 'bg-green-500',
    icon: CheckCircle,
    hex: '#10B981',
  },
  medio: {
    label: 'Riesgo Medio',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    bar: 'bg-yellow-400',
    icon: AlertTriangle,
    hex: '#F59E0B',
  },
  alto: {
    label: 'Riesgo Alto',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    bar: 'bg-orange-500',
    icon: AlertTriangle,
    hex: '#F97316',
  },
  critico: {
    label: 'Riesgo Crítico',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-600',
    icon: AlertTriangle,
    hex: '#DC2626',
  },
}

const factors = [
  { key: 'academic_score', label: 'Académico', icon: BookOpen, color: 'bg-blue-500' },
  { key: 'economic_score', label: 'Económico', icon: DollarSign, color: 'bg-green-500' },
  { key: 'emotional_score', label: 'Emocional', icon: Heart, color: 'bg-pink-500' },
  { key: 'motivation_score', label: 'Motivación', icon: Lightbulb, color: 'bg-yellow-400' },
  { key: 'adaptation_score', label: 'Adaptación', icon: Users2, color: 'bg-purple-500' },
]

function FactorBar({ label, score, icon: Icon, color }) {
  const pct = Math.max(0, Math.min(100, Math.round((score / 40) * 100)))
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-xs text-gray-500">{score} / 40 pts</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

export default function StudentPortalPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [risk, setRisk] = useState(null)
  const [surveyCount, setSurveyCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      studentsAPI.me(),
      riskAPI.me(),
      surveysAPI.myResponses(),
    ]).then(([profRes, riskRes, survRes]) => {
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data)
      if (riskRes.status === 'fulfilled') setRisk(riskRes.value.data)
      if (survRes.status === 'fulfilled') setSurveyCount(survRes.value.data.length)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Cargando tu portal…" />

  const cfg = risk ? (riskConfig[risk.risk_level] || riskConfig.bajo) : null
  const RiskIcon = cfg?.icon

  // Hour-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = user?.full_name?.split(' ')[0] || 'Estudiante'

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 admin-dark-text">
      <div className="md:flex w-full mx-auto px-6">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside className={`md:flex md:flex-col w-64 bg-white border-r p-6 md:min-h-screen fixed md:relative top-0 left-0 z-50 transform transition-transform dark:bg-slate-900 dark:border-slate-800 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-slate-100">Portal Estudiante</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">{user?.full_name?.split(' ')[0]}</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-slate-100">Portal Estudiante</p>
              <p className="text-xs text-gray-500 dark:text-slate-300">{user?.full_name?.split(' ')[0]}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <Link to="/admin/student-home" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
              <Home className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 dark:text-slate-200">Inicio</span>
            </Link>
            <Link to="/admin/surveys" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
              <ClipboardList className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 dark:text-slate-200">Encuestas</span>
            </Link>
            <Link to="/admin/student-profile" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 dark:text-slate-200">Mi perfil</span>
            </Link>
          </nav>

          <div className="mt-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="space-y-6 w-full">
            {/* Mobile menu button */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded shadow-sm"
              >
                <Menu className="w-4 h-4" />
                Menú
              </button>
            </div>

      {/* Welcome banner */}
      <motion.div
        className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white border-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-primary-200 text-sm">{greeting}</p>
              <h1 className="text-2xl font-bold">{user?.full_name}</h1>
              {profile && (
                <p className="text-primary-200 text-sm mt-0.5">
                  {profile.program} &middot; Semestre {profile.semester} &middot; Cód.&nbsp;{profile.student_code}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/surveys" className="hidden sm:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-white text-sm">
              Responder encuestas
            </Link>
            <Link to="/admin/student-profile" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-white text-sm">
              Mis datos
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Risk card */}
        {risk && cfg ? (
          <motion.div
            className={`card border ${cfg.border} ${cfg.bg} md:col-span-1 p-6`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
                Estado de riesgo
              </p>
              <RiskIcon className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <p className={`text-2xl font-bold ${cfg.color}`}>{cfg.label}</p>
            <div className="flex items-center gap-4">
              <RiskDonut value={risk.risk_score} size={92} stroke={10} color={cfg.hex} />
              <div>
                <p className={`text-3xl font-extrabold ${cfg.color} mb-1`}>
                  <AnimatedNumber value={risk.risk_score} className={`${cfg.color}`} />
                  <span className="text-base font-normal opacity-60 ml-2">/ 200</span>
                </p>
                <p className="text-xs text-gray-600">Evaluado el {new Date(risk.assessed_at).toLocaleDateString('es-CO')}</p>
              </div>
            </div>
            {/* mini bar */}
            <div className="h-2 bg-white/60 rounded-full overflow-hidden mt-1">
              <div
                className={`h-2 rounded-full ${cfg.bar}`}
                style={{ width: `${(risk.risk_score / 200) * 100}%` }}
              />
            </div>
            <p className="text-xs mt-2 opacity-70">
              Evaluado el {new Date(risk.assessed_at).toLocaleDateString('es-CO')}
            </p>
          </motion.div>
        ) : (
          <motion.div className="card border border-gray-200 text-center py-8 md:col-span-1" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Sin evaluación de riesgo aún</p>
            <p className="text-xs text-gray-400 mt-1">Completa tus datos y encuestas</p>
          </motion.div>
        )}

        {/* Quick stats */}
        <motion.div className="card md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
          <motion.div className="text-center p-6 bg-gray-50 rounded-xl" whileHover={{ scale: 1.03 }}>
            <p className="text-4xl font-bold text-gray-800"><AnimatedNumber value={profile?.semester ?? 0} className="" /></p>
            <p className="text-xs text-gray-500 mt-0.5">Semestre actual</p>
          </motion.div>
          <motion.div className="text-center p-6 bg-gray-50 rounded-xl" whileHover={{ scale: 1.03 }}>
            <p className="text-4xl font-bold text-gray-800"><AnimatedNumber value={profile ? Math.round(profile.cumulative_gpa * 10) / 10 : 0} /></p>
            <p className="text-xs text-gray-500 mt-0.5">Promedio acumulado</p>
          </motion.div>
          <motion.div className="text-center p-6 bg-gray-50 rounded-xl" whileHover={{ scale: 1.03 }}>
            <p className="text-4xl font-bold text-gray-800"><AnimatedNumber value={profile?.failed_courses ?? 0} /></p>
            <p className="text-xs text-gray-500 mt-0.5">Materias reprobadas</p>
          </motion.div>
          <motion.div className="text-center p-6 bg-gray-50 rounded-xl" whileHover={{ scale: 1.03 }}>
            <p className="text-4xl font-bold text-primary-600"><AnimatedNumber value={surveyCount} /></p>
            <p className="text-xs text-gray-500 mt-0.5">Encuestas respondidas</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Factor breakdown */}
      {risk && (
        <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="font-semibold text-gray-800 mb-4">Detalle por factor de riesgo</h2>
          <div className="space-y-4">
            {factors.map((f) => (
              <FactorBar
                key={f.key}
                label={f.label}
                score={risk[f.key]}
                icon={f.icon}
                color={f.color}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            * Puntajes más altos indican mayor contribución al riesgo de deserción.
          </p>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/surveys"
          className="card hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
            <ClipboardList className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Responder encuestas</p>
            <p className="text-sm text-gray-500">
              {surveyCount > 0
                ? `${surveyCount} encuesta${surveyCount > 1 ? 's' : ''} completada${surveyCount > 1 ? 's' : ''}`
                : 'Aún no has respondido ninguna'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </Link>

        <Link
          to="/admin/student-profile"
          className="card hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Mis datos personales</p>
            <p className="text-sm text-gray-500">
              {profile ? 'Actualiza tu información académica' : 'Completa tu perfil'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
        </Link>
      </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function AnimatedNumber({ value = 0, duration = 800, className = '' }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const initial = display
    const delta = value - initial
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(initial + delta * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <span className={className}>{display}</span>
}

function RiskDonut({ value = 0, size = 96, stroke = 10, color = '#10B981' }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, Math.round((value / 200) * 100)))
  const dash = (circumference * pct) / 100

  return (
    <div className="inline-flex items-center justify-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E6E7EA"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute" style={{ width: size, textAlign: 'center' }}>
        <div className="text-sm font-semibold text-gray-700">{pct}%</div>
      </div>
    </div>
  )
}
