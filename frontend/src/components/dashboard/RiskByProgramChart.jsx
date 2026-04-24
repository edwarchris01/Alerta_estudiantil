import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function RiskByProgramChart({ data }) {
  const chartData = data.map((d) => ({
    name:
      d.program.length > 20 ? d.program.slice(0, 18) + '…' : d.program,
    '% Riesgo': d.risk_percentage,
    'En riesgo': d.at_risk,
    Total: d.total,
  }))

  return (
    <div className="card hover:shadow-lg hover:shadow-slate-200/80 transition-shadow duration-300">
      <h3 className="font-semibold text-gray-800 mb-4">
        Riesgo por Programa Académico
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} unit="%" />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) =>
              name === '% Riesgo' ? `${value}%` : value
            }
          />
          <Bar dataKey="% Riesgo" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
