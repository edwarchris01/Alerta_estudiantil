import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { surveysAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  ClipboardList,
  CheckCircle,
  Star,
  Plus,
  Trash2,
  Eye,
  Pencil,
} from 'lucide-react'

const categoryLabels = {
  motivacion: 'Motivación',
  economica: 'Económica',
  emocional: 'Emocional',
  adaptacion: 'Adaptación',
  carga_academica: 'Carga Académica',
}

const categoryColors = {
  motivacion: 'bg-blue-100 text-blue-700',
  economica: 'bg-green-100 text-green-700',
  emocional: 'bg-purple-100 text-purple-700',
  adaptacion: 'bg-orange-100 text-orange-700',
  carga_academica: 'bg-pink-100 text-pink-700',
}

const initialCreateForm = {
  title: '',
  description: '',
  category: 'motivacion',
  questions: ['', '', ''],
}

export default function SurveysPage() {
  const { user } = useAuth()
  const isStudent = user?.role === 'estudiante'

  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [editingTemplateId, setEditingTemplateId] = useState(null)

  const loadTemplates = () => {
    setLoading(true)
    surveysAPI
      .templates()
      .then((res) => setTemplates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleScore = (questionId, score) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }))
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) return

    const answerList = Object.entries(answers).map(([qId, score]) => ({
      question_id: parseInt(qId),
      score,
    }))

    if (answerList.length !== selectedTemplate.questions.length) {
      alert('Por favor responde todas las preguntas')
      return
    }

    setSubmitting(true)
    try {
      await surveysAPI.respond({
        template_id: selectedTemplate.id,
        answers: answerList,
      })
      setSuccess(true)
      setSelectedTemplate(null)
      setAnswers({})
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al enviar encuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const updateQuestion = (index, value) => {
    setCreateForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) => (i === index ? value : question)),
    }))
  }

  const addQuestion = () => {
    setCreateForm((prev) => ({ ...prev, questions: [...prev.questions, ''] }))
  }

  const removeQuestion = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const createTemplate = async () => {
    const normalizedQuestions = createForm.questions.map((q) => q.trim()).filter(Boolean)

    if (!createForm.title.trim()) {
      alert('Ingresa el título de la encuesta')
      return
    }

    if (normalizedQuestions.length < 3) {
      alert('Agrega al menos 3 preguntas')
      return
    }

    setCreating(true)
    try {
      const payload = {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        category: createForm.category,
        questions: normalizedQuestions.map((question_text, index) => ({
          question_text,
          order: index + 1,
          weight: 1,
        })),
      }

      if (editingTemplateId) {
        await surveysAPI.updateTemplate(editingTemplateId, payload)
      } else {
        await surveysAPI.createTemplate(payload)
      }

      setCreateForm(initialCreateForm)
      setShowCreateForm(false)
      setEditingTemplateId(null)
      loadTemplates()
    } catch (err) {
      alert(err.response?.data?.detail || 'No se pudo guardar la encuesta')
    } finally {
      setCreating(false)
    }
  }

  const editTemplate = (template) => {
    setEditingTemplateId(template.id)
    setCreateForm({
      title: template.title || '',
      description: template.description || '',
      category: template.category,
      questions: [...template.questions]
        .sort((a, b) => a.order - b.order)
        .map((q) => q.question_text),
    })
    setShowCreateForm(true)
    setSelectedTemplate(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const archiveTemplate = async (templateId) => {
    const confirmed = window.confirm('¿Deseas archivar esta encuesta? Dejará de mostrarse a los estudiantes.')
    if (!confirmed) return

    try {
      await surveysAPI.deleteTemplate(templateId)
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }
      loadTemplates()
    } catch (err) {
      alert(err.response?.data?.detail || 'No se pudo archivar la encuesta')
    }
  }

  if (loading) return <LoadingSpinner message="Cargando encuestas…" />

  return (
    <div className="space-y-6 admin-dark-text">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Encuestas</h1>
        <p className="text-gray-500 dark:text-slate-300 text-sm mt-1">
          {isStudent
            ? 'Responde las encuestas para ayudarnos a apoyarte mejor'
            : 'Agrega nuevas encuestas y controla lo que verán los estudiantes en el portal'}
        </p>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-200"
        >
          <CheckCircle className="w-5 h-5" />
          Encuesta enviada exitosamente. ¡Gracias por tu participación!
        </motion.div>
      )}

      {!isStudent && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.08 }}
          className="card space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Gestión de encuestas</h2>
              <p className="text-sm text-gray-500 dark:text-slate-300">
                Las encuestas creadas aquí estarán disponibles de inmediato para el portal del estudiante.
              </p>
            </div>
            <button
              onClick={() => {
                if (!showCreateForm) {
                  setCreateForm(initialCreateForm)
                  setEditingTemplateId(null)
                }
                setShowCreateForm((prev) => !prev)
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showCreateForm ? 'Cerrar formulario' : 'Nueva encuesta'}
            </button>
          </div>

          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.28 }}
              className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4 overflow-hidden dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-slate-100">
                  {editingTemplateId ? 'Editar encuesta' : 'Nueva encuesta'}
                </h3>
                {editingTemplateId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplateId(null)
                      setCreateForm(initialCreateForm)
                      setShowCreateForm(false)
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. Encuesta de bienestar universitario"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    className="input-field"
                    value={createForm.category}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  className="input-field min-h-[96px]"
                  placeholder="Describe qué quieres medir con esta encuesta"
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">Preguntas</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar pregunta
                  </button>
                </div>

                {createForm.questions.map((question, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder={`Pregunta ${index + 1}`}
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      disabled={createForm.questions.length <= 3}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button onClick={createTemplate} disabled={creating} className="btn-primary">
                  {creating ? 'Guardando…' : editingTemplateId ? 'Actualizar encuesta' : 'Guardar encuesta'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {!selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="card cursor-pointer hover:shadow-lg hover:shadow-slate-200/80 transition-shadow"
            >
              <div
                onClick={() => {
                  setSelectedTemplate(t)
                  setAnswers({})
                }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      categoryColors[t.category] || ''
                    }`}
                  >
                    {categoryLabels[t.category] || t.category}
                  </span>
                  <h3 className="font-semibold text-gray-800 mt-2">{t.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{t.questions.length} preguntas</p>
                  {!isStudent && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-primary-600 inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Vista previa
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          editTemplate(t)
                        }}
                        className="text-xs text-amber-600 inline-flex items-center gap-1 hover:underline"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          archiveTemplate(t.id)
                        }}
                        className="text-xs text-red-600 inline-flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Archivar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card max-w-3xl mx-auto"
        >
          <button
            onClick={() => setSelectedTemplate(null)}
            className="text-sm text-primary-600 hover:underline mb-4"
          >
            ← Volver a encuestas
          </button>

          <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.title}</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">{selectedTemplate.description}</p>

          <div className="space-y-6">
            {[...selectedTemplate.questions]
              .sort((a, b) => a.order - b.order)
              .map((q) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800 mb-3">{q.question_text}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleScore(q.id, score)}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                          answers[q.id] === score
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 mx-auto mb-1 ${
                            answers[q.id] >= score
                              ? 'fill-primary-500 text-primary-500'
                              : 'text-gray-300'
                          }`}
                        />
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                    <span>Muy en desacuerdo</span>
                    <span>Muy de acuerdo</span>
                  </div>
                </div>
              ))}
          </div>

          {isStudent ? (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-6">
              {submitting ? 'Enviando…' : 'Enviar Respuestas'}
            </button>
          ) : (
            <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              Esta es la vista previa de la encuesta. Lo mismo verá el estudiante en el portal público.
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
