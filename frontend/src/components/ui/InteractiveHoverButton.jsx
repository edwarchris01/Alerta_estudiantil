import { motion } from 'motion/react'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'

const variants = {
  primary:
    'bg-[length:240%_100%] bg-gradient-to-r from-sky-300 via-sky-400 to-blue-900 bg-left text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/15 hover:bg-right hover:shadow-[0_20px_38px_-14px_rgba(37,99,235,0.6)]',
  secondary:
    'border border-sky-200 bg-[length:240%_100%] bg-gradient-to-r from-white via-sky-100 to-blue-700 bg-left text-slate-700 shadow-sm ring-1 ring-white/60 hover:bg-right hover:text-white hover:shadow-[0_16px_30px_-14px_rgba(59,130,246,0.42)]',
}

const buttonVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.03 },
}

const labelVariants = {
  rest: { x: 0 },
  hover: { x: -12 },
}

const iconVariants = {
  rest: { opacity: 0, x: 16 },
  hover: { opacity: 1, x: 0 },
}

export default function InteractiveHoverButton({
  children,
  icon,
  className,
  variant = 'primary',
  type = 'button',
  disabled = false,
  ...props
}) {
  const Icon = icon || ArrowRight

  return (
    <motion.button
      type={type}
      disabled={disabled}
      initial="rest"
      whileHover={disabled ? 'rest' : 'hover'}
      animate="rest"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      variants={buttonVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className={clsx(
        'group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    >
      <span
        className={clsx(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          variant === 'primary'
            ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.12)_34%,transparent_66%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18)_0%,rgba(59,130,246,0.08)_34%,transparent_66%)]'
        )}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
        whileHover={{ width: 320, height: 320 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
      />
      <motion.span
        className="absolute inset-y-[-18%] left-[-45%] w-[34%] rotate-[12deg] bg-white/35 blur-[1px]"
        whileHover={{ x: '390%' }}
        transition={{ duration: 0.56, ease: 'easeOut' }}
      />
      <motion.span
        variants={labelVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="relative z-10 inline-flex items-center"
      >
        {children}
      </motion.span>
      {Icon ? (
        <motion.span
          variants={iconVariants}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          className="absolute right-4 z-10 inline-flex"
        >
          <Icon className="h-4 w-4" />
        </motion.span>
      ) : null}
    </motion.button>
  )
}
