import { clsx } from 'clsx'
import React from 'react'

type NativeButtonProps = React.ComponentProps<'button'>

export interface ButtonProps extends NativeButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'default' | 'outline' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function UIButton({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }: ButtonProps): JSX.Element {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600': variant === 'primary' || variant === 'default',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500 border border-gray-300': variant === 'secondary' || variant === 'outline',
          'hover:bg-gray-100 focus-visible:ring-gray-500': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600': variant === 'danger' || variant === 'destructive',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
  disabled={disabled || loading}
  {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}

export default UIButton
export const Button = UIButton