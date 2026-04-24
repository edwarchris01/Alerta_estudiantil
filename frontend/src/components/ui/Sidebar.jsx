import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  AlertTriangle,
  LogOut,
  Shield,
  GraduationCap,
  Home,
  UserCog,
} from 'lucide-react'

const navItems = [
  {
    to: '/admin/student-home',
    label: 'Inicio',
    icon: Home,
    roles: ['estudiante'],
  },
  {
    to: '/admin/student-profile',
    label: 'Mis datos',
    icon: UserCog,
    roles: ['estudiante'],
  },
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'coordinador', 'bienestar'],
  },
  {
    to: '/admin/students',
    label: 'Estudiantes',
    icon: Users,
    roles: ['admin', 'coordinador', 'bienestar'],
  },
  {
    to: '/admin/surveys',
    label: 'Encuestas',
    icon: ClipboardList,
    roles: ['admin', 'coordinador', 'bienestar', 'estudiante'],
  },
  {
    to: '/admin/alerts',
    label: 'Alertas',
    icon: AlertTriangle,
    roles: ['admin', 'coordinador', 'bienestar'],
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SIGAE</h1>
            <p className="text-xs text-gray-400">Alerta Estudiantil</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
