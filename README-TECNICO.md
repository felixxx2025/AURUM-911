# 📘 AURUM-911 — README TÉCNICO

## 🧭 Visão Geral

**AURUM-911** é uma plataforma SaaS multi-tenant white-label voltada para gestão integrada de recursos humanos, finanças, identidade digital, benefícios e observabilidade. Cada módulo (hub) é isolado por domínio de negócio e pode ser ativado por tenant conforme plano contratado.

- **Arquitetura**: Microsserviços com isolamento lógico por `tenant_id`
- **Tecnologias**: Node.js, React, PostgreSQL, Redis, Kafka, Kubernetes
- **Segurança**: JWT, OAuth2, SAML, MFA, Vault, ABAC
- **Observabilidade**: Prometheus, Grafana, Loki, OpenTelemetry
- **Compliance**: LGPD, GDPR, eSocial, ISO 27001

## 🧱 Estrutura Atual do Projeto

```
AURUM-911/
├─ docs/                           # Documentação técnica
│   ├─ overview.md                 # Visão geral da plataforma
│   ├─ hrplus.md                   # HR+ canônico (detalhado)
│   ├─ integrations.md             # Integrações com parceiros
│   ├─ dashboards.md               # KPIs e métricas
│   ├─ rbac.md                     # Controle de acesso
│   ├─ observability.md            # Monitoramento e segurança
│   ├─ runbooks.md                 # Procedimentos operacionais
│   └─ sql-models.md               # Modelos de dados
├─ services/                       # Microsserviços
│   └─ hrplus-api/                 # API HR+ (Fastify + TypeScript)
│       ├─ src/
│       │   ├─ index.ts            # Servidor principal
│       │   └─ repo/               # Repositórios de dados
│       ├─ prisma/
│       │   └─ schema.prisma       # Schema do banco
│       └─ Dockerfile
├─ openapi/                        # Especificações OpenAPI
│   └─ hrplus.yml                  # API HR+ documentada
├─ examples/                       # Payloads de exemplo
│   ├─ zetra-consig-eligibility.request.json
│   ├─ consigamais-eligibility.request.json
│   └─ finsphere-transfer.request.json
├─ infra/                          # Infraestrutura
│   └─ helm/hrplus-api/            # Chart Helm
├─ db/migrations/                  # Migrações SQL
│   └─ 0001_init.sql
└─ .github/workflows/              # CI/CD
    └─ ci.yml
```

## 🏗️ Arquitetura Planejada (Roadmap)

### Estrutura Completa Futura
```
AURUM/
├─ core-orchestrator/              # Orquestração entre hubs
├─ shared/                         # Serviços comuns (auth, logs, search)
├─ api-gateway/                    # Roteamento, versionamento, throttling
├─ tenant-service/                # Provisionamento e branding
├─ billing/                        # Planos, consumo, faturas
├─ hubs/                           # Módulos de negócio
│   ├─ hrplus/                     # ✅ Recursos Humanos (implementado)
│   ├─ finsphere/                  # Finanças e pagamentos
│   ├─ neocrypto/                  # Blockchain e custódia
│   ├─ trustid/                    # Identidade digital
│   ├─ smartlab/                   # LMS e aprendizado
│   ├─ lifeplus/                   # Benefícios e seguros
│   ├─ sentinel/                   # Antifraude e scoring
│   ├─ cloudforge/                 # Observabilidade e deploy
│   ├─ globaledge/                 # Internacionalização
│   └─ visionx/                    # Dashboards e KPIs
├─ partner-onboarding/            # Wizard de integração de parceiros
├─ marketplace/                   # Catálogo de integrações
├─ infra/                         # Helm, Terraform, K8s
└─ observability/                 # Playbooks, tracing, alertas
```

## 🔐 Autenticação e Autorização

### Endpoints Implementados
- `POST /api/v1/auth/login`: SSO, MFA, subdomínio por tenant
- Headers: `x-tenant-id` para isolamento multi-tenant

### Planejado
- `/auth/tenant-lookup`: resolve branding
- `/auth/forgot-password`, `/auth/verify-otp`: recuperação e verificação
- JWT com claims de tenant e roles
- RBAC: SUPERADMIN, TENANT_ADMIN, HR_MANAGER, PAYROLL_ADMIN, HR_USER, AUDITOR, READONLY

## 📄 Páginas e Rotas por Hub

### HR+ (Implementado)
**Endpoints REST Ativos:**
- `GET /api/v1/hr/people`: listar colaboradores com paginação
- `GET /api/v1/hr/people/{id}`: perfil individual
- `POST /api/v1/hr/people`: criar colaborador
- `PUT /api/v1/hr/people/{id}`: atualizar dados
- `POST /api/v1/hr/payroll/run`: processamento de folha
- `POST /api/v1/hr/time/punch`: registro de ponto

**Páginas UI Planejadas:**
- `/hr/people/list`: colaboradores com filtros
- `/hr/people/{id}/profile`: tabs com contrato, folha, benefícios
- `/hr/payroll/run`: processamento de folha
- `/hr/time/punch`: ponto com biometria
- `/hr/compliance/documents`: documentos e assinaturas

### FinSphere (Planejado)
- `/fin/accounts`: contas digitais
- `/fin/loans`: crédito consignado
- `/fin/payments/transfer`: pagamentos
- `POST /api/v1/fin/payments/transfer`: ✅ endpoint implementado

### TrustID (Planejado)
- `/trustid/kyc`: verificação de identidade
- `/trustid/liveness`: prova de vida
- `/trustid/audit`: logs de identidade

### VisionX (Planejado)
- `/visionx/reports`: KPIs por módulo
- `/visionx/alerts`: alertas configuráveis
- `/visionx/custom`: builder de dashboards

## 🔁 Fluxos Críticos

### Onboarding de Tenant
1. Criação via `/tenant/create`
2. Provisionamento automático
3. Configuração de branding e roles

### Adiantamento Salarial (Implementado Parcialmente)
1. Solicitação via `/hr/benefits/advances`
2. Consulta à API ConsigaMais: ✅ `POST /api/v1/partners/zetra-consig/eligibility`
3. Pagamento via FinSphere: ✅ `POST /api/v1/fin/payments/transfer`
4. Dedução na folha seguinte

## 🔌 Integrações

### Implementadas (Mock)
- **Zetra Consig**: elegibilidade de crédito consignado
- **FinSphere**: transferências e pagamentos

### Planejadas
- ConsigaMais
- ZetraPay
- Kenoby
- Fireblocks
- Serpro
- IDwall

### Payloads de Exemplo
Disponíveis em `/examples/`:
- `zetra-consig-eligibility.request.json`
- `consigamais-eligibility.request.json`
- `finsphere-transfer.request.json`

## 🧬 Modelos de Dados

### Implementado (Prisma)
```prisma
// services/hrplus-api/prisma/schema.prisma
model Employee {
  id         String   @id @default(cuid())
  tenant_id  String
  first_name String?
  last_name  String?
  email      String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

### Planejado (SQL Completo)
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT,
  cnpj TEXT,
  plan TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  cpf TEXT,
  name TEXT,
  hire_date DATE,
  status TEXT,
  metadata JSONB
);
```

## 📊 Dashboards e KPIs

### HR+ Métricas
- Headcount
- Turnover
- Payroll MTD
- Time-to-hire

### FinSphere Métricas
- Volume diário
- Saldo por conta
- Taxa de aprovação

### TrustID Métricas
- KYC aprovados
- Falhas de liveness
- Alertas AML

## 🛡️ Segurança e Observabilidade

### Implementado
- Multi-tenancy por `tenant_id`
- Logs estruturados (Fastify)
- Isolamento de dados por tenant

### Planejado
- **Logs**: Loki
- **Métricas**: Prometheus
- **Tracing**: OpenTelemetry
- **Auditoria**: append-only, signed
- **Playbooks**: `/helios/audit-playbooks`

## 🚀 Como Executar

### Desenvolvimento Local
```bash
cd /root/AURUM-911
npm install
npm run dev
# API disponível em http://localhost:3000
```

### Com Docker
```bash
docker-compose up -d
```

### Testes
```bash
npm test
npm run lint
npm run format
```

## 📋 Próximos Passos

### Curto Prazo
1. ✅ Implementar persistência PostgreSQL nos endpoints HR+
2. ✅ Adicionar validação Zod nos endpoints
3. 🔄 Implementar autenticação JWT real
4. 🔄 Adicionar middleware de tenant isolation

### Médio Prazo
1. Criar API Gateway com roteamento
2. Implementar tenant-service para provisionamento
3. Adicionar módulos FinSphere e TrustID
4. Configurar observabilidade (Prometheus/Grafana)

### Longo Prazo
1. Implementar todos os hubs planejados
2. Marketplace de integrações
3. Compliance LGPD/GDPR completo
4. Deployment em Kubernetes

## 📚 Documentação Técnica

- **Visão Geral**: `docs/overview.md`
- **HR+ Detalhado**: `docs/hrplus.md`
- **Integrações**: `docs/integrations.md`
- **OpenAPI**: `openapi/hrplus.yml`
- **Modelos SQL**: `docs/sql-models.md`
- **RBAC**: `docs/rbac.md`
- **Observabilidade**: `docs/observability.md`

## 🏷️ Tecnologias

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+

### Frontend (Planejado)
- **Framework**: React 18+
- **State**: Zustand/Redux Toolkit
- **UI**: Tailwind CSS + Headless UI
- **Forms**: React Hook Form + Zod

### DevOps
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes + Helm
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Loki

---

**Status do Projeto**: 🟡 Em Desenvolvimento Ativo
**Última Atualização**: Novembro 2024
**Versão**: 0.1.0