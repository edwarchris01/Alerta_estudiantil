# Política Ética — SIGAE

## Principios Fundamentales

### 1. Confidencialidad
Los índices de riesgo son **estrictamente confidenciales**. Solo personal autorizado
(coordinadores, bienestar, administración) puede acceder a esta información.

### 2. No Estigmatización
- El sistema **no etiqueta** a los estudiantes como "problema"
- Las alertas son herramientas de apoyo, no de juicio
- El lenguaje del sistema es neutral y constructivo
- Los datos de riesgo **nunca** se muestran públicamente

### 3. Consentimiento Informado
- Los estudiantes deben dar su consentimiento antes de responder encuestas
- Se explica claramente el propósito y uso de la información
- El estudiante puede solicitar ver su información en cualquier momento

### 4. Intervención Humana
- El sistema **no reemplaza** la intervención humana
- Toda acción de apoyo debe ser realizada por personal capacitado
- Las decisiones finales las toman los profesionales de bienestar

### 5. Protección de Datos
- Cumplimiento con la **Ley 1581 de 2012** (Habeas Data — Colombia)
- Encriptación de contraseñas con bcrypt
- Control de acceso basado en roles (RBAC)
- Tokens JWT con expiración configurable
- Registro de auditoría de intervenciones

### 6. Transparencia
- Los estudiantes pueden solicitar ver su información
- Los criterios de evaluación de riesgo son documentados y explicables
- No se usan "cajas negras" en la Fase 1 (sistema basado en reglas)
- En la Fase 2, se documentará la importancia de cada factor del modelo ML

---

## Prohibiciones Explícitas

| Acción | Estado |
|--------|--------|
| Mostrar índices de riesgo públicamente | 🚫 Prohibido |
| Usar datos para fines disciplinarios | 🚫 Prohibido |
| Compartir información con terceros no autorizados | 🚫 Prohibido |
| Tomar decisiones automáticas sin revisión humana | 🚫 Prohibido |
| Discriminar estudiantes basándose en alertas | 🚫 Prohibido |
