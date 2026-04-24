import { clsx } from 'clsx'

const levelConfig = {
  bajo: {
    label: 'Bajo',
    bg: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
  medio: {
    label: 'Medio',
    bg: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
  },
  alto: {
    label: 'Alto',
    bg: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  critico: {
    label: 'Crítico',
    bg: 'bg-red-200 text-red-900',
    dot: 'bg-red-700',
  },
}

export default function RiskBadge({ level }) {
  const config = levelConfig[level] || levelConfig.bajo

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        config.bg
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
