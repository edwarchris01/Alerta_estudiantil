import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor: agregar token JWT ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sigae_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Interceptor: manejar 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isLoginRequest = requestUrl.includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('sigae_token')
      localStorage.removeItem('sigae_user')
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)

// ══════════════ Auth ══════════════
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
}

// ══════════════ Students ══════════════
export const studentsAPI = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.patch(`/students/${id}`, data),
  publicRegister: (data) => api.post('/students/public-register', data),
  programs: () => api.get('/students/programs'),
  withDetails: (program) =>
    api.get('/students/with-details', { params: program ? { program } : {} }),
  // Estudiante — perfil propio
  me: () => api.get('/students/me'),
  updateMe: (data) => api.patch('/students/me', data),
}

// ══════════════ Surveys ══════════════
export const surveysAPI = {
  templates: () => api.get('/surveys/templates'),
  getTemplate: (id) => api.get(`/surveys/templates/${id}`),
  createTemplate: (data) => api.post('/surveys/templates', data),
  updateTemplate: (id, data) => api.patch(`/surveys/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/surveys/templates/${id}`),
  respond: (data) => api.post('/surveys/respond', data),
  myResponses: () => api.get('/surveys/my-responses'),
  studentResponses: (studentId) =>
    api.get(`/surveys/student/${studentId}/responses`),
  // Portal público (sin token)
  publicTemplates: () => api.get('/surveys/templates'),
  respondPublic: (data) => api.post('/surveys/respond-public', data),
}

// ══════════════ Risk ══════════════
export const riskAPI = {
  assess: (studentId) => api.post(`/risk/assess/${studentId}`),
  assessAll: () => api.post('/risk/assess-all'),
  getLatest: (studentId) => api.get(`/risk/student/${studentId}`),
  dashboard: () => api.get('/risk/dashboard'),
  createIntervention: (data) => api.post('/risk/interventions', data),
  studentInterventions: (studentId) => api.get(`/risk/interventions/student/${studentId}`),
  // Estudiante — riesgo propio
  me: () => api.get('/risk/me'),
  assessMe: () => api.post('/risk/me/assess'),
}

export default api
