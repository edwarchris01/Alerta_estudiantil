import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, LogIn, Shield } from 'lucide-react'
import InteractiveHoverButton from '../components/ui/InteractiveHoverButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'estudiante' ? '/admin/student-home' : '/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden admin-dark-text">
      {/* Fondo — imagen universidad */}
      <img
        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay oscuro degradado azul-rojo como en la imagen */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-red-700/50" />

      {/* Card central */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <motion.div
          className="absolute -inset-6 rounded-[34px] bg-sky-400/15 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.98, 1.03, 0.98] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[24px] bg-white/95 shadow-2xl backdrop-blur-sm ring-1 ring-slate-200/80"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[24px] overflow-hidden">
            <div className="absolute inset-0 rounded-[24px] border-2 border-sky-200/70" />
            <div className="absolute inset-[3px] rounded-[21px] border border-white/55" />

            <motion.div
              className="absolute top-0 h-[4px] w-36 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-sky-500 opacity-100 blur-[1px]"
              animate={{ x: ['-18%', '108%', '-18%'] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute right-0 h-28 w-[4px] rounded-full bg-gradient-to-b from-transparent via-blue-500 to-cyan-300 opacity-100 blur-[1px]"
              animate={{ y: ['-18%', '108%', '-18%'] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'linear', delay: 0.45 }}
            />
            <motion.div
              className="absolute bottom-0 h-[4px] w-32 rounded-full bg-gradient-to-r from-transparent via-fuchsia-400 to-rose-400 opacity-100 blur-[1px]"
              animate={{ x: ['108%', '-18%', '108%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 0.9 }}
            />
            <motion.div
              className="absolute left-0 h-24 w-[4px] rounded-full bg-gradient-to-b from-transparent via-cyan-400 to-sky-300 opacity-100 blur-[1px]"
              animate={{ y: ['108%', '-18%', '108%'] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'linear', delay: 1.35 }}
            />

            <motion.div
              className="absolute -top-6 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full bg-cyan-300/35 blur-2xl"
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[-20px] right-8 h-10 w-32 rounded-full bg-fuchsia-400/30 blur-2xl"
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-100/80 to-transparent" />
          <div className="pointer-events-none absolute -right-8 top-6 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />
          <div className="pointer-events-none absolute -left-6 bottom-10 h-20 w-20 rounded-full bg-fuchsia-200/20 blur-2xl" />

          <div className="relative">
            {/* Logo + título */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4 shadow-inner"
              >
                <Shield className="w-7 h-7 text-gray-500" />
              </motion.div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Fundación Universitaria María Cano
              </h1>
              <p className="text-xs text-gray-400 mt-1 tracking-wide">Acceso al Campus Virtual</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-xs"
                >
                  {error}
                </motion.div>
              )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@fumc.edu.co"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-gray-50 placeholder-gray-400 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <button type="button" className="text-xs text-blue-600 hover:underline">
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-gray-50 placeholder-gray-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordar */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-500">Recordar sesión en este equipo</span>
            </label>

            {/* Submit */}
            <InteractiveHoverButton
              type="submit"
              disabled={loading}
              icon={loading ? undefined : LogIn}
              className="py-3 rounded-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando…
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </InteractiveHoverButton>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium tracking-wider">O CONTINUAR CON</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Microsoft */}
              <InteractiveHoverButton
                type="button"
                variant="secondary"
                className="py-2.5 rounded-lg font-medium"
              >
                <span className="inline-flex items-center gap-2.5">
                  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                Cuenta de Microsoft 365
                </span>
              </InteractiveHoverButton>
            </form>

            {/* Footer card */}
            <div className="px-8 pb-6 text-center space-y-3">
              <p className="text-xs text-gray-500">
                ¿No tienes una cuenta?{' '}
                <span className="font-semibold text-gray-700 cursor-pointer hover:underline">
                  Contactar soporte
                </span>
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="hover:underline cursor-pointer">Términos</span>
                <span className="hover:underline cursor-pointer">Privacidad</span>
                <span className="hover:underline cursor-pointer">Ayuda</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Portal seguro tag */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-white/60" />
          <span className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">
            Portal Seguro de Identidad
          </span>
        </div>
      </div>
    </div>
  )
}
