import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:border-orange-500 dark:focus:border-orange-600',
          'transition-colors duration-200',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
