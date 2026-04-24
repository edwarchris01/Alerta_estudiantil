import { motion } from 'motion/react'
import { clsx } from 'clsx'

const colorMap = {
  primary: 'bg-primary-50 text-primary-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="card flex items-start gap-4 hover:shadow-lg hover:shadow-slate-200/80 transition-shadow"
    >
      <div
        className={clsx(
          'w-12 h-12 rounded-lg flex items-center justify-center',
          colorMap[color]
        )}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  )
}
