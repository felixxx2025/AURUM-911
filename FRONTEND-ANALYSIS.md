# 🎨 AURUM Frontend - Análise e Planejamento

## 📊 Análise do Contexto Atual

### Backend Disponível
- ✅ API HR+ funcional (Fastify + TypeScript)
- ✅ Endpoints: auth, people, payroll, time, partners
- ✅ Multi-tenancy por header `x-tenant-id`
- ✅ Estrutura de dados definida (Prisma)
- 🔄 JWT real (pendente)

### Requisitos Identificados
- **Multi-tenant**: Branding por subdomínio
- **White-label**: Logo, cores, domínio customizável
- **Roles**: 7 níveis (SUPERADMIN → READONLY)
- **Módulos**: HR+, FinSphere, TrustID, VisionX
- **Responsivo**: Desktop-first, mobile-friendly

## 🏗️ Arquitetura Frontend

### Stack Tecnológico Recomendado
```
Frontend Stack:
├─ Framework: Next.js 14 (App Router)
├─ Language: TypeScript
├─ Styling: Tailwind CSS + Headless UI
├─ State: Zustand + React Query
├─ Forms: React Hook Form + Zod
├─ Charts: Recharts + Chart.js
├─ Icons: Heroicons + Lucide React
├─ Auth: NextAuth.js
└─ Build: Turbo (monorepo)
```

### Estrutura de Diretórios
```
apps/
├─ web/                           # App principal Next.js
│   ├─ app/                       # App Router (Next.js 14)
│   │   ├─ (auth)/               # Grupo de rotas auth
│   │   │   ├─ login/
│   │   │   ├─ forgot-password/
│   │   │   └─ verify-otp/
│   │   ├─ (dashboard)/          # Grupo protegido
│   │   │   ├─ dashboard/
│   │   │   ├─ hr/
│   │   │   ├─ fin/
│   │   │   └─ partners/
│   │   ├─ api/                  # API Routes
│   │   ├─ globals.css
│   │   └─ layout.tsx
│   ├─ components/               # Componentes reutilizáveis
│   │   ├─ ui/                   # Design System
│   │   ├─ forms/
│   │   ├─ charts/
│   │   └─ layout/
│   ├─ lib/                      # Utilitários
│   │   ├─ api.ts
│   │   ├─ auth.ts
│   │   ├─ utils.ts
│   │   └─ validations.ts
│   └─ types/                    # Tipos TypeScript
packages/
├─ ui/                           # Design System compartilhado
├─ config/                       # Configs ESLint/Tailwind
└─ types/                        # Tipos compartilhados
```

## 🔐 Página de Login

### Design e UX
```
Layout: Tela dividida (50/50)
├─ Esquerda: Branding + Ilustração
│   ├─ Logo do tenant (white-label)
│   ├─ Tagline personalizada
│   ├─ Ilustração/vídeo de fundo
│   └─ Cores do tema do tenant
└─ Direita: Formulário de login
    ├─ Campo subdomain (auto-detect)
    ├─ Campo email/username
    ├─ Campo password
    ├─ Checkbox "Lembrar-me"
    ├─ Link "Esqueci senha"
    ├─ Botão "Entrar"
    └─ Links SSO (Google, Microsoft)
```

### Fluxo de Autenticação
1. **Detecção de Tenant**: `subdomain.aurum.com` → resolve branding
2. **Login Form**: Validação client-side (Zod)
3. **API Call**: `POST /api/v1/auth/login`
4. **JWT Storage**: httpOnly cookies + localStorage
5. **Redirect**: Dashboard baseado no role

### Estados da UI
- **Loading**: Skeleton + spinner
- **Error**: Toast notifications
- **Success**: Smooth transition
- **MFA**: Modal para OTP/biometria

## 📊 Dashboard Principal

### Layout Responsivo
```
Desktop Layout:
├─ Header (60px)
│   ├─ Logo + Tenant name
│   ├─ Module switcher (HR+, FinSphere, etc.)
│   ├─ Search global
│   ├─ Notifications (bell)
│   └─ User menu + avatar
├─ Sidebar (240px)
│   ├─ Navigation menu
│   ├─ Quick actions
│   └─ Collapse toggle
└─ Main Content
    ├─ Breadcrumbs
    ├─ Page title + actions
    └─ Content area (widgets/tables)
```

### Widgets do Dashboard HR+
```
Grid Layout (12 colunas):
├─ Row 1: KPIs principais (4 cards)
│   ├─ Headcount (ativo/probação/desligados)
│   ├─ Turnover (12 meses)
│   ├─ Payroll MTD (custo + forecast)
│   └─ Time-to-hire (média)
├─ Row 2: Gráficos (8+4)
│   ├─ Cashflow Forecast (linha, 3 meses)
│   └─ Compliance Alerts (lista)
├─ Row 3: Tabelas (6+6)
│   ├─ Onboarding Pipeline
│   └─ Churn Risk (top 10)
└─ Row 4: Actions rápidas
    ├─ "Processar Folha"
    ├─ "Importar Colaboradores"
    └─ "Relatório eSocial"
```

### Navegação Modular
```
Sidebar Navigation:
├─ 📊 Dashboard
├─ 👥 Pessoas
│   ├─ Lista de colaboradores
│   ├─ Importar dados
│   └─ Organograma
├─ 💰 Folha de Pagamento
│   ├─ Calendário
│   ├─ Processar folha
│   ├─ Relatórios
│   └─ Adiantamentos
├─ ⏰ Ponto e Frequência
│   ├─ Registrar ponto
│   ├─ Aprovações
│   └─ Relatórios
├─ 🎯 Recrutamento
│   ├─ Vagas abertas
│   ├─ Pipeline
│   └─ Candidatos
├─ 🏥 Benefícios
│   ├─ Catálogo
│   ├─ Adesões
│   └─ Sinistros
├─ 📈 Performance
│   ├─ OKRs
│   ├─ Avaliações
│   └─ Treinamentos
├─ 📋 Compliance
│   ├─ Documentos
│   ├─ eSocial
│   └─ Auditoria
├─ 🤝 Parceiros
│   ├─ Integrações
│   ├─ Contratos
│   └─ Onboarding
└─ ⚙️ Configurações
    ├─ Empresa
    ├─ Usuários
    └─ Integrações
```

## 🎨 Design System

### Paleta de Cores (White-label)
```css
/* Cores base (customizáveis por tenant) */
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  
  --gray-50: #f9fafb;
  --gray-500: #6b7280;
  --gray-900: #111827;
  
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}

/* Tema escuro */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
}
```

### Componentes Base
```
UI Components:
├─ Button (variants: primary, secondary, ghost, danger)
├─ Input (text, email, password, search)
├─ Select (single, multi, async)
├─ Modal (sizes: sm, md, lg, xl)
├─ Toast (success, error, warning, info)
├─ Table (sortable, filterable, paginated)
├─ Card (header, body, footer)
├─ Badge (status, role, priority)
├─ Avatar (user, company, placeholder)
├─ Skeleton (loading states)
└─ Charts (line, bar, pie, donut)
```

## 📱 Responsividade

### Breakpoints
```css
/* Mobile First */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop small */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Desktop XL */
```

### Layout Adaptativo
- **Mobile**: Sidebar collapsa em drawer
- **Tablet**: Sidebar fica visível mas estreita
- **Desktop**: Layout completo com sidebar fixa

## 🔄 Estado e Dados

### Gerenciamento de Estado
```typescript
// Zustand stores
├─ useAuthStore: user, tenant, permissions
├─ useUIStore: sidebar, theme, notifications
├─ usePeopleStore: employees, filters, pagination
├─ usePayrollStore: runs, reports, approvals
└─ usePartnersStore: integrations, status
```

### API Integration
```typescript
// React Query hooks
├─ useAuth: login, logout, refresh
├─ usePeople: list, get, create, update
├─ usePayroll: runs, reports, process
├─ usePartners: eligibility, transfers
└─ useDashboard: widgets, metrics, alerts
```

## 🚀 Performance

### Otimizações
- **Code Splitting**: Por módulo (HR+, FinSphere)
- **Lazy Loading**: Componentes pesados
- **Image Optimization**: Next.js Image
- **Caching**: React Query + SWR
- **Bundle Analysis**: @next/bundle-analyzer

### Métricas Alvo
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **Bundle Size**: < 500KB inicial

## 🔒 Segurança Frontend

### Implementações
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Sanitização de inputs
- **CSRF**: Tokens em formulários
- **JWT Validation**: Client-side checks
- **Route Guards**: Proteção por role

## 📋 Roadmap de Implementação

### Fase 1: Fundação (2-3 semanas)
- [ ] Setup Next.js + TypeScript
- [ ] Design System base (Tailwind + Headless UI)
- [ ] Página de login funcional
- [ ] Autenticação JWT
- [ ] Layout base com sidebar

### Fase 2: Dashboard Core (2 semanas)
- [ ] Dashboard principal com widgets
- [ ] Navegação modular
- [ ] Componentes de tabela e formulários
- [ ] Integração com API HR+

### Fase 3: Módulos HR+ (3-4 semanas)
- [ ] Gestão de pessoas (CRUD)
- [ ] Processamento de folha
- [ ] Registro de ponto
- [ ] Relatórios básicos

### Fase 4: White-label (1-2 semanas)
- [ ] Branding por tenant
- [ ] Temas customizáveis
- [ ] Subdomínios
- [ ] Logo e cores dinâmicas

### Fase 5: Módulos Avançados (4-6 semanas)
- [ ] FinSphere (contas e pagamentos)
- [ ] TrustID (KYC e verificação)
- [ ] VisionX (dashboards customizáveis)
- [ ] Marketplace de integrações

## 🎯 Próximos Passos Imediatos

1. **Criar estrutura Next.js** no monorepo
2. **Implementar página de login** com branding
3. **Dashboard básico** com widgets HR+
4. **Integração com API** existente
5. **Sistema de roles** e proteção de rotas