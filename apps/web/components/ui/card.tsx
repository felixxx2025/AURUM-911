
// Usamos any para compatibilidade ampla e evitar falhas de build por diferenças de tipos entre versões do React/TS
export function Card({ className = '', ...props }: any) {
  return <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props} />
}

export function CardHeader({ className = '', ...props }: any) {
  return <div className={`p-4 border-b border-gray-100 ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: any) {
  return <div className={`p-4 ${className}`} {...props} />
}

export function CardFooter({ className = '', ...props }: any) {
  return <div className={`p-4 border-t border-gray-100 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: any) {
  return <h3 className={`text-base font-semibold leading-6 text-gray-900 ${className}`} {...props} />
}
