import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function RiskBySemesterChart({ data }) {
  const chartData = data.map((d) => ({
    name: `Sem ${d.semester}`,
    '% Riesgo': d.risk_percentage,
    'En riesgo': d.at_risk,
    Total: d.total,
  }))

  return (
    <div className="card hover:shadow-lg hover:shadow-slate-200/80 transition-shadow duration-300">
      <h3 className="font-semibold text-gray-800 mb-4">
        Riesgo por Semestre
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip
            formatter={(value, name) =>
              name === '% Riesgo' ? `${value}%` : value
            }
          />
          <Area
            type="monotone"
            dataKey="% Riesgo"
            stroke="#f59e0b"
            fill="#fef3c7"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
