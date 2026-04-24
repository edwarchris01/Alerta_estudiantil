import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/ui/Sidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import SurveysPage from './pages/SurveysPage'
import AlertsPage from './pages/AlertsPage'
import StudentPortalPage from './pages/StudentPortalPage'
import StudentProfilePage from './pages/StudentProfilePage'
import PublicSurveyPortalPage from './pages/PublicSurveyPortalPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ThemeToggle from './components/ui/ThemeToggle'

// ── Layout protegido: redirige a /admin si no hay sesión ────────
function ProtectedLayout({ children }) {
  const { user, isStaff } = useAuth()
  if (!user) return <Navigate to="/admin" replace />
  // Mostrar Sidebar solo a staff (admin/coordinador/bienestar)
  if (isStaff) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    )
  }
  // Estudiante autenticado: no aplicar sidebar global (usa su propio layout)
  return <div className="min-h-screen">{children}</div>
}

function StaffRoute({ children }) {
  const { isStaff } = useAuth()
  if (!isStaff) return <Navigate to="/admin/student-home" replace />
  return children
}

function StudentRoute({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'estudiante') return <Navigate to="/admin/dashboard" replace />
  return children
}

// ── Todas las rutas del sistema SIGAE (bajo /admin) ─────────────
function AdminRoutes() {
  const { loading, user } = useAuth()
  if (loading) return <LoadingSpinner message="Iniciando SIGAE…" />
  const defaultHome = user?.role === 'estudiante' ? '/admin/student-home' : '/admin/dashboard'

  return (
    <Routes>
      {/* Login del sistema — /admin y /admin/login */}
      <Route index element={user ? <Navigate to={defaultHome} /> : <LoginPage />} />
      <Route path="login" element={user ? <Navigate to={defaultHome} /> : <LoginPage />} />

      {/* Rutas de staff */}
      <Route
        path="dashboard"
        element={
          <ProtectedLayout><StaffRoute><DashboardPage /></StaffRoute></ProtectedLayout>
        }
      />
      <Route
        path="students"
        element={
          <ProtectedLayout><StaffRoute><StudentsPage /></StaffRoute></ProtectedLayout>
        }
      />
      <Route
        path="alerts"
        element={
          <ProtectedLayout><StaffRoute><AlertsPage /></StaffRoute></ProtectedLayout>
        }
      />

      {/* Encuestas: staff y estudiantes autenticados */}
      <Route
        path="surveys"
        element={<ProtectedLayout><SurveysPage /></ProtectedLayout>}
      />

      {/* Rutas del estudiante autenticado */}
      <Route
        path="student-home"
        element={
          <ProtectedLayout><StudentRoute><StudentPortalPage /></StudentRoute></ProtectedLayout>
        }
      />
      <Route
        path="student-profile"
        element={
          <ProtectedLayout><StudentRoute><StudentProfilePage /></StudentRoute></ProtectedLayout>
        }
      />

      {/* Catch-all dentro de /admin */}
      <Route path="*" element={<Navigate to={user ? defaultHome : '/admin'} replace />} />
    </Routes>
  )
}

// ── App root — separación total entre portal estudiantil y SIGAE ─
export default function App() {
  const { idleWarning, idleCountdown, continueSession, logout, user } = useAuth()

  return (
    <>
      <ThemeToggle />
      <Routes>
        {/* ══ PORTAL DEL ESTUDIANTE — público, sin login ══ */}
        <Route path="/" element={<PublicSurveyPortalPage />} />
        <Route path="/portal/*" element={<PublicSurveyPortalPage />} />

        {/* ══ SISTEMA SIGAE PARA ADMINISTRADORES ══ */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Cualquier otra ruta va al portal del estudiante */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {user && idleWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sesion por inactividad</h2>
            <p className="text-sm text-gray-600 mt-2">
              Deseas continuar? Se cerrara la sesion en {idleCountdown} segundos.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={logout}
                className="btn-secondary"
              >
                Cerrar sesion
              </button>
              <button
                type="button"
                onClick={continueSession}
                className="btn-primary"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

