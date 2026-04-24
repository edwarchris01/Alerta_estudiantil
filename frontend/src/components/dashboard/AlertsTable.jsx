import RiskBadge from '../ui/RiskBadge'

export default function AlertsTable({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card hover:shadow-lg hover:shadow-slate-200/80 transition-shadow duration-300">
        <h3 className="font-semibold text-gray-800 mb-4">
          Alertas Recientes
        </h3>
        <p className="text-gray-500 text-sm">No hay alertas activas</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden hover:shadow-lg hover:shadow-slate-200/80 transition-shadow duration-300">
      <h3 className="font-semibold text-gray-800 mb-4">
        Estudiantes en Alerta
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-3 font-medium">Código</th>
              <th className="pb-3 font-medium">Nombre</th>
              <th className="pb-3 font-medium">Programa</th>
              <th className="pb-3 font-medium">Sem.</th>
              <th className="pb-3 font-medium">Nivel</th>
              <th className="pb-3 font-medium">Puntaje</th>
              <th className="pb-3 font-medium">Factor Principal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <tr
                key={alert.student_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 font-mono text-xs">
                  {alert.student_code}
                </td>
                <td className="py-3 font-medium">{alert.student_name}</td>
                <td className="py-3 text-gray-600">{alert.program}</td>
                <td className="py-3 text-center">{alert.semester}</td>
                <td className="py-3">
                  <RiskBadge level={alert.risk_level} />
                </td>
                <td className="py-3 font-semibold text-center">
                  {alert.risk_score}
                </td>
                <td className="py-3 text-gray-600">{alert.top_factor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
