# 🏆 AURUM-911 — Plataforma SaaS Multi-tenant

**Plataforma completa de gestão empresarial** com módulos de RH, finanças, identidade digital e observabilidade. Arquitetura moderna com Next.js + Fastify + PostgreSQL.

## 🚀 Status do Projeto

- ✅ **Backend API** (Fastify + TypeScript + Prisma)
- ✅ **Frontend Web** (Next.js 14 + Tailwind + TypeScript)
- ✅ **Design System** (Componentes reutilizáveis)
- ✅ **Autenticação** (JWT + Multi-tenancy)
- ✅ **Páginas Core** (Login + Dashboard + Colaboradores)
- 🔄 **Integração Real** (Em desenvolvimento)

## 🏗️ Arquitetura

```
AURUM-911/
├── apps/web/                    # 🎨 Frontend Next.js
│   ├── app/                     # App Router (Next.js 14)
│   │   ├── auth/login/          # ✅ Página de login
│   │   ├── dashboard/           # ✅ Dashboard principal
│   │   └── hr/people/           # ✅ Gestão de colaboradores
│   ├── components/ui/           # ✅ Design System
│   └── lib/                     # ✅ API client + Auth
├── services/hrplus-api/         # 🔧 Backend Fastify
│   ├── src/                     # ✅ Endpoints REST
│   └── prisma/                  # ✅ Schema de dados
├── docs/                        # 📚 Documentação técnica
├── openapi/                     # 📋 Especificação API
└── examples/                    # 💡 Payloads de exemplo
```

## 📚 Documentação Técnica

- **[Visão Geral](docs/overview.md)** — Conceitos e arquitetura
- **[HR+ Detalhado](docs/hrplus.md)** — Módulo canônico
- **[Integrações](docs/integrations.md)** — Parceiros e APIs
- **[OpenAPI](openapi/hrplus.yml)** — Especificação completa

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT + Multi-tenancy

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Headless UI
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Icons**: Heroicons + Lucide React

## ⚡ Início Rápido

### 1. Instalação
```bash
git clone <repo>
cd AURUM-911
npm install
```

### 2. Executar Desenvolvimento
```bash
# Opção 1: Tudo junto
npm run dev:all

# Opção 2: Separadamente
npm run dev      # Backend (porta 3000)
npm run dev:web  # Frontend (porta 3001)
```

### 3. Acessar
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Login**: Qualquer email/senha (mock)

## 🎯 Funcionalidades Implementadas

### 🔐 Autenticação
- ✅ Página de login responsiva
- ✅ Branding white-label
- ✅ Gerenciamento de estado JWT
- ✅ Multi-tenancy por header

### 📊 Dashboard
- ✅ KPIs principais (headcount, folha, turnover)
- ✅ Navegação modular
- ✅ Ações rápidas
- ✅ Layout responsivo

### 👥 Gestão de Pessoas
- ✅ Lista de colaboradores
- ✅ Busca e filtros
- ✅ Estados de loading
- ✅ Integração com API

### 🎨 Design System
- ✅ Componentes reutilizáveis (Button, Input)
- ✅ Sidebar com navegação
- ✅ Variáveis CSS customizáveis
- ✅ Tema white-label

## 🔌 API Endpoints

### Autenticação
```http
POST /api/v1/auth/login
```

### Colaboradores
```http
GET    /api/v1/hr/people
GET    /api/v1/hr/people/{id}
POST   /api/v1/hr/people
PUT    /api/v1/hr/people/{id}
```

### Folha de Pagamento
```http
POST   /api/v1/hr/payroll/run
```

### Integrações
```http
POST   /api/v1/partners/zetra-consig/eligibility
POST   /api/v1/fin/payments/transfer
```

## 🎯 Próximos Passos

### Fase 1: Integração Real (1-2 semanas)
- [ ] Conectar PostgreSQL real
- [ ] Implementar JWT completo
- [ ] Middleware de autenticação
- [ ] Validação Zod nos endpoints

### Fase 2: Funcionalidades Core (2-3 semanas)
- [ ] CRUD completo de colaboradores
- [ ] Processamento de folha real
- [ ] Sistema de roles (RBAC)
- [ ] Gráficos e relatórios

### Fase 3: White-label (1-2 semanas)
- [ ] Branding dinâmico por tenant
- [ ] Temas customizáveis
- [ ] Upload de logo
- [ ] Subdomínios

### Fase 4: Módulos Avançados (3-4 semanas)
- [ ] FinSphere (finanças)
- [ ] TrustID (identidade)
- [ ] VisionX (dashboards)
- [ ] Marketplace de integrações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**AURUM-911** - Transformando a gestão empresarial com tecnologia moderna 🚀
