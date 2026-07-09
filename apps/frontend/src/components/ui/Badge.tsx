import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'gray'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-blue-50 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3 py-1 text-xs',
}

function Badge({ variant = 'gray', size = 'md', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
