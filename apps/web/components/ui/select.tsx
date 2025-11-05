
export interface SelectOption { label: string; value: string | number }

// Implementação mínima compatível com a API esperada
export function Select({ value, onValueChange, children, className = '', ...props }: any) {
  // Renderiza um wrapper; o controle real pode ser feito via SelectTrigger/SelectContent
  // Usa value/onValueChange como metadados para evitar warnings e facilitar testes/inspeção
  return (
    <div
      className={className}
      data-select-container
      data-value={value}
      data-has-on-change={Boolean(onValueChange)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectTrigger({ className = '', children, ...props }: any) {
  return (
    <button className={`border rounded-md px-3 py-2 text-left w-full ${className}`} {...props}>
      {children}
    </button>
  )
}

export function SelectValue({ placeholder, value, children }: any) {
  return <span>{children ?? value ?? placeholder ?? ''}</span>
}

export function SelectContent({ className = '', children, ...props }: any) {
  return (
    <div className={`mt-2 rounded-md border bg-white shadow ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SelectItem({ value, className = '', children, onSelect, ...props }: any) {
  return (
    <div
      role="option"
      data-value={value}
      className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${className}`}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </div>
  )
}
