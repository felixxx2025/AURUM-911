import { clsx } from 'clsx'
import React from 'react'

type NativeInputProps = React.ComponentProps<'input'>

export interface InputProps extends NativeInputProps {
  label?: string
  error?: string
  helperText?: string
}

export function UIInput({ className, label, error, helperText, id, ...props }: InputProps): JSX.Element {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
          error ? 'ring-red-300 focus:ring-red-600' : 'ring-gray-300 focus:ring-blue-600',
          className
        )}
        {...(props as any)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}

export default UIInput
export const Input = UIInput