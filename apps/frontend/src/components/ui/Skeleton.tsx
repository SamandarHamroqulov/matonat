import { cn } from '../../utils/cn'

type SkeletonVariant = 'text' | 'card' | 'table-row'

interface SkeletonProps {
  variant?: SkeletonVariant
  className?: string
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  card: 'h-28 w-full rounded-lg',
  'table-row': 'h-12 w-full rounded-md',
}

function Skeleton({ variant = 'text', className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-gray-100', variantClasses[variant], className)} />
}

export default Skeleton
