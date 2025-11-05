interface Translations {
  [key: string]: {
    [locale: string]: string
  }
}

const translations: Translations = {
  'auth.invalid_credentials': {
    'pt-BR': 'Credenciais inválidas',
    'en-US': 'Invalid credentials',
    'es-ES': 'Credenciales inválidas',
  },
  'auth.mfa_required': {
    'pt-BR': 'Autenticação de dois fatores necessária',
    'en-US': 'Two-factor authentication required',
    'es-ES': 'Autenticación de dos factores requerida',
  },
  'rate_limit.exceeded': {
    'pt-BR': 'Muitas tentativas. Tente novamente em {time}',
    'en-US': 'Too many attempts. Try again in {time}',
    'es-ES': 'Demasiados intentos. Inténtalo de nuevo en {time}',
  },
  'employee.not_found': {
    'pt-BR': 'Funcionário não encontrado',
    'en-US': 'Employee not found',
    'es-ES': 'Empleado no encontrado',
  },
  'validation.required': {
    'pt-BR': 'Campo obrigatório',
    'en-US': 'Required field',
    'es-ES': 'Campo requerido',
  },
}

export class I18n {
  private locale: string = 'pt-BR'

  constructor(locale?: string) {
    if (locale) this.locale = locale
  }

  t(key: string, params?: Record<string, any>): string {
    const translation = translations[key]?.[this.locale] || translations[key]?.['pt-BR'] || key
    
    if (!params) return translation
    
    return Object.entries(params).reduce(
      (text, [param, value]) => text.replace(`{${param}}`, String(value)),
      translation
    )
  }

  setLocale(locale: string) {
    this.locale = locale
  }

  getLocale(): string {
    return this.locale
  }

  static detectLocale(acceptLanguage?: string): string {
    if (!acceptLanguage) return 'pt-BR'
    
    const supported = ['pt-BR', 'en-US', 'es-ES']
    const preferred = acceptLanguage.split(',')[0]?.split('-')[0]
    
    switch (preferred) {
      case 'pt': return 'pt-BR'
      case 'en': return 'en-US'
      case 'es': return 'es-ES'
      default: return 'pt-BR'
    }
  }
}