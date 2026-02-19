import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'pendente' | 'preparado' | 'entregue' | 'default' | 'warning' | 'info' | 'success' | 'destructive'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    preparado: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    entregue: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    default: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    info: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    success: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    destructive: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
