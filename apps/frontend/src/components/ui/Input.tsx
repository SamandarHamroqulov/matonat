import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputVariant = 'default' | 'error'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: InputVariant
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, variant = 'default', className, id, ...props },
  ref,
) {
  const derivedVariant = error ? 'error' : variant

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-10 w-full rounded-md border px-3 text-sm text-gray-900 transition placeholder:text-gray-400 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15',
          derivedVariant === 'error'
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
            : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
