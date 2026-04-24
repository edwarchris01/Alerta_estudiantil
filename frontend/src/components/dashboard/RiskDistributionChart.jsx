import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const COLORS = {
  bajo: '#22c55e',
  medio: '#f59e0b',
  alto: '#ef4444',
  critico: '#7c2d12',
}
const LABELS = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
}

export default function RiskDistributionChart({ distribution }) {
  const data = Object.entries(distribution).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    color: COLORS[key] || '#94a3b8',
  }))

  return (
    <div className="card hover:shadow-lg hover:shadow-slate-200/80 transition-shadow duration-300">
      <h3 className="font-semibold text-gray-800 mb-4">
        Distribución de Riesgo
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
