# AURUM-911 — Monorepo

Plataforma SaaS multi-tenant white-label. Este repositório traz documentação completa e um serviço inicial (HR+ API) para acelerar o desenvolvimento.

## 📋 Documentação

- **[README Técnico Completo](README-TECNICO.md)** — Documento técnico de referência com arquitetura, endpoints, modelos, fluxos e roadmap
- **[Correlação do Projeto](CORRELACAO-PROJETO.md)** — Mapeamento do que está implementado vs. planejado
- **[Visão Geral](docs/overview.md)** — Conceitos gerais da plataforma
- **[HR+ Detalhado](docs/hrplus.md)** — Módulo canônico com páginas, APIs e workflows

## 🧱 Estrutura

- `docs/` — visão geral, HR+, integrações, dashboards, RBAC, observability, runbooks, modelos SQL
- `openapi/` — especificação OpenAPI do HR+
- `examples/` — payloads de exemplo (Zetra Consig, ConsigaMais, FinSphere)
- `services/hrplus-api/` — serviço Fastify (TypeScript) com endpoints-base
- `infra/helm/hrplus-api` — chart Helm simples
- `db/migrations/` — SQL inicial

## Requisitos

- Node.js 20+
- npm 9+

## Rodando local

```bash
npm install
npm run dev
# abre em http://localhost:3000
```

## Build e Testes

```bash
npm run build
npm test
```

## 📖 Documentação Técnica

- **[README Técnico](README-TECNICO.md)** — Documento completo de referência
- **[Guia Geral](docs/overview.md)** — Visão geral da plataforma
- **[HR+ Canônico](docs/hrplus.md)** — Módulo de referência
- **[OpenAPI](openapi/hrplus.yml)** — Especificação da API

## Próximos passos

- Implementar persistência (PostgreSQL/Prisma) nos endpoints
- Adicionar API Gateway e autenticação JWT/SSO
- Criar pipelines de CI/CD e imagens container
