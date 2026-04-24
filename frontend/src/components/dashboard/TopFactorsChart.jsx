import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function TopFactorsChart({ data }) {
  const chartData = data.map((d) => ({
    name: d.factor,
    'Puntaje Total': d.total_score,
  }))

  return (
    <div className="card hover:shadow-lg hover:shadow-slate-200/80 transition-shadow duration-300">
      <h3 className="font-semibold text-gray-800 mb-4">
        Factores de Riesgo Más Frecuentes
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="Puntaje Total"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
