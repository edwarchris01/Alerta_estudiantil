import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

export const BorderBeam = ({
  className,
  size = 240,
  delay = 0,
  duration = 8,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  transition,
  style,
  reverse = false,
  borderWidth = 1,
}) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      style={style}
    >
      <motion.div
        className={cn('absolute -inset-[140%] opacity-90 blur-md', className)}
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 210deg, ${colorFrom} 260deg, ${colorTo} 310deg, transparent 360deg)`,
        }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
          ...transition,
        }}
      />

      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          padding: `${borderWidth}px`,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.14))',
        }}
      >
        <div
          className="h-full w-full rounded-[calc(1rem-1px)]"
          style={{ background: 'white' }}
        />
      </div>

      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full opacity-70"
        style={{
          width: `${size}px`,
          height: `${Math.max(60, size / 3)}px`,
          background: `radial-gradient(circle, ${colorFrom}55 0%, ${colorTo}25 45%, transparent 75%)`,
          filter: 'blur(18px)',
        }}
      />
    </div>
  )
}
