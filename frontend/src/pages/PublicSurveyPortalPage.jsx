/**
 * PublicSurveyPortalPage — Portal público de evaluación académica.
 * Registra al estudiante real y luego le muestra las encuestas activas.
 */
import { useState } from 'react'
import { studentsAPI } from '../services/api'
import {
  GraduationCap,
  User,
  CheckCircle,
  Wifi,
  Lock,
  Headphones,
} from 'lucide-react'

function Field({ label, id, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent transition ${error ? 'border-red-400' : 'border-gray-200'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function WelcomePhase({ onNext, registering }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    student_code: '',
    citizen_id: '',
    program: '',
    phone: '',
    semester: '',
    enrollment_year: String(new Date().getFullYear()),
  })
  const [errors, setErrors] = useState({})
  const [showModal, setShowModal] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = () => {
    const nextErrors = {}
    if (!form.full_name.trim()) nextErrors.full_name = 'Ingresa tu nombre completo'
    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo institucional'
    if (!form.password.trim()) nextErrors.password = 'Ingresa una contraseña'
    if (!form.student_code.trim()) nextErrors.student_code = 'Ingresa tu código estudiantil'
    if (!form.citizen_id.trim()) nextErrors.citizen_id = 'Ingresa tu número de cédula'
    if (!form.program.trim()) nextErrors.program = 'Ingresa tu carrera'
    if (!form.phone.trim()) nextErrors.phone = 'Ingresa tu número de celular'
    if (!form.semester) nextErrors.semester = 'Ingresa tu semestre'
    if (!form.enrollment_year) nextErrors.enrollment_year = 'Ingresa tu año de ingreso'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext(form)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 admin-dark-text">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200 dark:bg-slate-950/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Maria Cano</p>
              <p className="text-[10px] font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-300">
                Portal Estudiantil
              </p>
            </div>
          </div>
          <div className="hidden md:block text-xs text-slate-500 dark:text-slate-300">
            Portal institucional
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <img
              src="/hero-v2.jpg"
              alt="Campus"
              className="w-full h-[320px] object-cover"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 dark:bg-blue-500/10 dark:text-blue-300">
              COMPROMETIDOS CON TU FUTURO
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              Tu exito y permanencia es nuestra prioridad
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-xl">
              En la Fundacion Universitaria Maria Cano te acompanamos en cada paso de tu formacion profesional.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition"
              >
                Iniciar Sesion
              </a>
              <button
                onClick={() => setShowModal(true)}
                className="border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-white border border-slate-200 rounded-2xl p-8 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center">Por que elegir Maria Cano?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 text-center mt-2">
            Nuestra trayectoria y compromiso te abren el camino al exito.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { icon: Wifi, title: 'Calidad Acreditada', desc: 'Programas con altos estandares y reconocimiento.' },
              { icon: Lock, title: 'Innovacion Constante', desc: 'Metodologias modernas para un aprendizaje real.' },
              { icon: Headphones, title: 'Inclusion Real', desc: 'Educacion accesible con enfoque humano.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center dark:bg-blue-500/10">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Crear perfil de estudiante</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">Completa tu informacion para acceder a tus encuestas.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-300">X</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Nombre completo"
                id="full_name"
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="Ej. Maria Perez"
                error={errors.full_name}
              />
              <Field
                label="Correo institucional"
                id="email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="nombre@fumc.edu.co"
                error={errors.email}
              />
              <Field
                label="Contrasena"
                id="password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Minimo 6 caracteres"
                error={errors.password}
              />
              <Field
                label="Codigo estudiantil"
                id="student_code"
                value={form.student_code}
                onChange={set('student_code')}
                placeholder="MC-2026-001"
                error={errors.student_code}
              />
              <Field
                label="Cedula"
                id="citizen_id"
                value={form.citizen_id}
                onChange={set('citizen_id')}
                placeholder="12345678"
                error={errors.citizen_id}
              />
              <Field
                label="Carrera"
                id="program"
                value={form.program}
                onChange={set('program')}
                placeholder="Ej. Ingenieria de Sistemas"
                error={errors.program}
              />
              <Field
                label="Numero de celular"
                id="phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="3001234567"
                error={errors.phone}
              />
              <Field
                label="Semestre"
                id="semester"
                type="number"
                value={form.semester}
                onChange={set('semester')}
                placeholder="1"
                error={errors.semester}
              />
              <Field
                label="Ano de ingreso"
                id="enrollment_year"
                type="number"
                value={form.enrollment_year}
                onChange={set('enrollment_year')}
                placeholder="2026"
                error={errors.enrollment_year}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={registering}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
            >
              {registering ? 'Registrando…' : 'Crear perfil'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PortalHeader({ studentInfo }) {
  return (
    <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-black/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Fundación Universitaria María Cano</p>
          <p className="text-[10px] font-semibold tracking-widest text-blue-300 uppercase">
            Portal Académico
          </p>
        </div>
      </div>
      {studentInfo && (
        <div className="flex items-center gap-2">
          <div className="text-right leading-tight">
            <p className="font-semibold text-white text-sm">{studentInfo.user_name || studentInfo.full_name}</p>
            <p className="text-xs text-blue-300">Estudiante — {studentInfo.program}</p>
          </div>
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white/70" />
          </div>
        </div>
      )}
    </header>
  )
}

function SuccessPhase({ studentInfo }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-blue-950/85 to-gray-900/90" />
      <div className="relative z-10 flex flex-col flex-1">
        <PortalHeader studentInfo={studentInfo} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Registro exitoso!</h2>
            <p className="text-blue-200/70 text-sm mb-1">
              Tu información ya quedó registrada y también aparece en administración,{' '}
              <span className="font-semibold text-white">{(studentInfo.user_name || studentInfo.full_name).split(' ')[0]}</span>.
            </p>
            <p className="text-white/30 text-xs mt-3">
              Ahora podrás ingresar al sistema con tu correo y contraseña institucionales.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all active:scale-95 text-sm shadow-lg shadow-blue-600/30"
            >
              Volver al inicio
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function PublicSurveyPortalPage() {
  const [phase, setPhase] = useState('welcome')
  const [studentInfo, setStudentInfo] = useState(null)
  const [registering, setRegistering] = useState(false)

  const handleWelcomeNext = async (formData) => {
    setRegistering(true)
    try {
      const registrationRes = await studentsAPI.publicRegister({
        ...formData,
        semester: Number(formData.semester),
        enrollment_year: Number(formData.enrollment_year),
      })
      setStudentInfo(registrationRes.data)
      setPhase('success')
    } catch (err) {
      alert(err.response?.data?.detail || 'No se pudo registrar al estudiante')
    } finally {
      setRegistering(false)
    }
  }

  if (phase === 'welcome') {
    return <WelcomePhase onNext={handleWelcomeNext} registering={registering} />
  }

  return <SuccessPhase studentInfo={studentInfo} />
}
