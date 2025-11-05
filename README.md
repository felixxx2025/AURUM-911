# 🏆 AURUM-911 — Plataforma SaaS Multi-tenant

**Plataforma completa de gestão empresarial** com módulos de RH, finanças, identidade digital e observabilidade. Arquitetura moderna com Next.js + Fastify + PostgreSQL.

## 🚀 Status do Projeto

- ✅ **Backend API** (Fastify + TypeScript + Prisma)
- ✅ **Frontend Web** (Next.js 14 + Tailwind + TypeScript)
- ✅ **Design System** (Componentes reutilizáveis)
- ✅ **Autenticação** (OAuth 2.1 + JWT RS256 + Multi-tenant)
- ✅ **Páginas Core** (Login + Dashboard + Colaboradores)
- 🔄 **Integração Real** (Em desenvolvimento)

## 🏗️ Arquitetura

```text
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
- **[Webhooks](docs/webhooks.md)** — Catálogo de eventos, segurança HMAC e boas práticas
- Endpoint útil: `GET /webhooks/catalog` — tipos de eventos e exemplos de payloads
- **[Pesquisa de Produto e Gap Analysis](docs/product-research.md)** — Diagnóstico de mercado e roadmap
- **[Addendum: Checklist + Conectores](docs/product-research-addendum.md)** — Cobertura atual vs. roadmap e integrações prioritárias
- **[Catálogo de Integrações](docs/integrations-catalog.md)** — Parceiros, fintechs, bancos e serviços prioritários por categoria

## 🛠️ Stack Tecnológico

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Auth**: OAuth 2.1 (Client Credentials) + JWT (RS256) + Multi-tenant

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

### 2. Configurar Banco de Dados

```bash
# Subir PostgreSQL com Docker
npm run docker:up

# Executar migrações
npm run db:migrate

# Popular com dados de exemplo
npm run db:seed
```

### 3. Executar Desenvolvimento

```bash
# Opção 1: Tudo junto
npm run dev:all

# Opção 2: Separadamente
npm run dev      # Backend (porta 3000)
npm run dev:web  # Frontend (porta 3001)
```

### 4. Acessar

- **Frontend**: <http://demo.localhost:3001> (ou <http://localhost:3001>)
- **Backend API**: <http://localhost:3000>
- **Login Demo**: <mailto:admin@demo.aurum.cool> / admin123
- **Prisma Studio**: `npm run db:studio`

## 🎯 Funcionalidades Implementadas

### 🔐 Autenticação

- ✅ JWT completo com refresh tokens e rotação automática
- ✅ MFA (Multi-Factor Authentication) com TOTP e QR Code
- ✅ Autenticação por subdomínio (demo.aurum.cool)
- ✅ Middleware de segurança avançado
- ✅ Hash de senhas com bcrypt
- ✅ CORS configurado para *.aurum.cool
- ✅ Session management com controle de dispositivos
- ✅ Token blacklist para logout seguro

### 📊 Dashboard

- ✅ KPIs principais (headcount, folha, turnover)
- ✅ Navegação modular
- ✅ Ações rápidas
- ✅ Layout responsivo

### 👥 Gestão de Pessoas

- ✅ CRUD completo com PostgreSQL
- ✅ Validação Zod em todos os endpoints
- ✅ Busca por nome, email e CPF
- ✅ Paginação e filtros avançados
- ✅ Isolamento por tenant

### 🔌 Integrações Reais

- ✅ **SERPRO**: Validação CPF/CNPJ oficial
- ✅ **eSocial**: Envio de eventos trabalhistas
- ✅ **PIX**: Pagamentos instantâneos BACEN
- ✅ **Kenoby ATS**: Sincronização de vagas e candidatos
- ✅ **OpenAI**: Assistente de RH com IA
- ✅ **Webhooks**: Notificações automáticas

### 🏢 Módulos Empresariais

- ✅ **FinSphere**: Banco digital completo com contas, PIX, empréstimos
- ✅ **TrustID**: Verificação de identidade com KYC, liveness, biometria
- ✅ **VisionX**: Analytics avançado com dashboards customizáveis
- ✅ **White-label**: Sistema completo de branding e temas

### 🏪 Marketplace e Ecosistema

- ✅ **App Store**: Marketplace completo com 156+ apps
- ✅ **SDK Público**: APIs REST com autenticação por chave
- ✅ **Sistema de Permissões**: Controle granular (employees:read, payroll:write, etc.)
- ✅ **Portal do Desenvolvedor**: Submissão, aprovação e gestão de apps
- ✅ **Revenue Sharing**: Compartilhamento automático de receita (70/30)
- ✅ **Analytics para Desenvolvedores**: Métricas de uso e earnings
- ✅ **App Analytics**: Dashboards de performance e instalações

### 🛠️ Infraestrutura Enterprise

- ✅ **Cache L1/L2**: Redis + cache local otimizado
- ✅ **Filas BullMQ**: Processamento assíncrono
- ✅ **Auditoria**: Compliance LGPD/SOX
- ✅ **Notificações**: SendGrid + Twilio + FCM
- ✅ **Observabilidade**: Prometheus + 15+ métricas customizadas
- ✅ **Admin Dashboard**: Monitoramento 24/7
- ✅ **Segurança Avançada**: Rate limiting + detecção de ataques
- ✅ **Performance Optimization**: Batch processing + lazy loading

### 🎨 Design System

- ✅ Componentes reutilizáveis (Button, Input)
- ✅ Sidebar com navegação
- ✅ Variáveis CSS customizáveis
- ✅ Tema white-label

## 🔌 API Endpoints

### Infra / OAuth 2.1

```http
GET  /.well-known/jwks.json   # JWKS (chaves públicas RS256)
POST /oauth2/token            # Fluxo client_credentials
GET  /status                  # Status + metadados (build/commit/uptime)
GET  /metrics                 # Métricas Prometheus
GET  /health                  # Liveness
GET  /health/ready            # Readiness
```

Cabeçalhos de robustez suportados pela API:

- `Idempotency-Key` (POST): garante repetição segura (replay) de requisições críticas, retornando a mesma resposta.
- `X-Correlation-Id`: correlação ponta-a-ponta para rastreabilidade (aparece em logs e tracing).

### Parceiros (Keys, Webhooks, Logs)

```http
POST /api/v1/partners                        # cria parceiro (clientId/secret + webhookSecret)
GET  /api/v1/partners                        # lista parceiros
POST /api/v1/partners/:id/rotate-credentials # rotaciona clientSecret e webhookSecret
POST /api/v1/partners/:id/webhooks           # registra webhook (url, eventTypes[])
GET  /api/v1/partners/:id/webhooks           # lista webhooks
GET  /api/v1/partners/:id/logs               # lista entregas (status, tentativas)
POST /api/v1/partners/:id/webhooks/:deliveryId/replay # reenvia entrega
```

Escopos: `partners:admin`, `partners:read`, `partners:webhooks`, `partners:replay`.

Portal do Parceiro (UI):

- Criar/selecionar parceiro; rotacionar credenciais; copiar `clientId`, `clientSecret` e `webhookSecret` com máscara.
- Cadastrar webhooks (URL + tipos de eventos).
- Disparar eventos de teste (Sandbox) com payload JSON opcional.
- Logs com filtros (status, busca), paginação e exportação CSV.
- Logs com filtros (status, busca, intervalo de data), paginação e exportação CSV (página e "tudo").
- Detalhes de entrega com payload e resposta HTTP, ambos copiáveis.

### Sandbox (datasets, reset, eventos)

```http
GET  /sandbox/datasets     # lista datasets
POST /sandbox/reset        # reset básico
POST /sandbox/events/:type # dispara evento sintético (gera payload se body vazio)
```

Escopos: `sandbox:manage`, `sandbox:events`.

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
# SERPRO
POST   /api/v1/integrations/serpro/validate-cpf

# Kenoby ATS
GET    /api/v1/integrations/kenoby/jobs
POST   /api/v1/integrations/kenoby/sync-hired

# OpenAI
POST   /api/v1/integrations/openai/analyze-resume
POST   /api/v1/integrations/openai/hr-assistant

# eSocial
POST   /api/v1/integrations/esocial/send-admission

# Webhooks
POST   /api/v1/webhooks/{webhookId}
GET    /api/v1/webhooks/{webhookId}/deliveries

# Legacy
POST   /api/v1/partners/zetra-consig/eligibility
POST   /api/v1/fin/payments/transfer
```

## 🔔 Webhooks (HMAC)

- Assinatura: `HMAC-SHA256` com `webhookSecret` do parceiro
- Cabeçalhos:
  - `x-aurum-signature`: `t=<timestamp>,v1=<sha256_hmac>`
  - `x-aurum-timestamp`: `<timestamp_em_segundos>`
- Base string: `<timestamp>.<body_json>`
- Tolerância sugerida: 5 minutos

Para mais detalhes de OAuth 2.1 (JWKS, token) e Sandbox, veja `services/hrplus-api/README.md`.

## 🎯 Próximos Passos

### ✅ Fase 1: Integração Real (CONCLUÍDA)

- ✅ PostgreSQL + Prisma ORM
- ✅ JWT completo com refresh tokens
- ✅ Middleware de autenticação
- ✅ Validação Zod nos endpoints
- ✅ Subdomínios (*.aurum.cool)
- ✅ Seed com dados de demonstração

### ✅ Fase 2: Infraestrutura Avançada (CONCLUÍDA)

- ✅ **Redis Cache**: Otimização de performance
- ✅ **Sistema de Filas**: BullMQ para processamento assíncrono
- ✅ **Auditoria LGPD**: Logs imutáveis e compliance
- ✅ **Notificações**: Email, SMS, Push multi-canal
- ✅ **Métricas**: Prometheus + observabilidade
- ✅ **Dashboard Admin**: Monitoramento completo

### ✅ Fase 3: Módulos Empresariais (CONCLUÍDA)

- ✅ **FinSphere**: Contas digitais, transações, empréstimos
- ✅ **TrustID**: KYC, liveness, verificação de identidade
- ✅ **VisionX**: Dashboards customizáveis e analytics
- ✅ **White-label**: Temas, branding dinâmico, CSS customizável
- ✅ **Interface Unificada**: Páginas para todos os módulos

### ✅ Fase 4: Marketplace e Ecosistema (CONCLUÍDA)

- ✅ **Marketplace de Apps**: Loja completa com instalação e gestão
- ✅ **SDK Público**: APIs com autenticação por chave
- ✅ **Sistema de Permissões**: Controle granular de acesso
- ✅ **Interface de Desenvolvedores**: Submissão e gestão de apps
- ✅ **Revenue Sharing**: Sistema automático de compartilhamento
- ✅ **Analytics Avançado**: Dashboards e métricas em tempo real

### ✅ Fase 4.5: Segurança e Performance (CONCLUÍDA)

- ✅ **MFA (Multi-Factor Authentication)**: TOTP com QR Code
- ✅ **Refresh Tokens**: Rotação automática e blacklist
- ✅ **Rate Limiting**: Proteção inteligente por endpoint
- ✅ **Cache Otimizado**: L1/L2 com métricas de hit/miss
- ✅ **Monitoramento Avançado**: Prometheus + alertas
- ✅ **Performance Optimization**: Batch processing e lazy loading
- ✅ **Detecção de Ataques**: Proteção em tempo real
- ✅ **Session Management**: Controle de sessões ativas

### 🔄 Fase 5: Escala Global (3-4 semanas)

- [ ] **Multi-idioma**: Internacionalização (PT, EN, ES)
- [ ] **CDN Global**: Distribuição de conteúdo mundial
- [ ] **Compliance Internacional**: GDPR, SOX, HIPAA
- [ ] **Marketplace Global**: Apps de desenvolvedores mundiais
- [ ] **Auto-scaling**: Kubernetes + métricas
- [ ] **Multi-região**: Replicação de dados
- [ ] **IA Avançada**: Insights preditivos

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
