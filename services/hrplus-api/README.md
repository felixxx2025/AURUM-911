# HR+ API (AURUM-911)

API Fastify em TypeScript com autenticação OAuth 2.1/JWT (RS256), RBAC/escopos, validação com Zod, métricas Prometheus e tracing OpenTelemetry.

## Endpoints principais

- POST /api/v1/auth/login — autenticação (stub)
- GET /api/v1/hr/people — listagem de pessoas (repo em memória ou Prisma)
- GET /metrics — métricas Prometheus
- GET /health — liveness
- GET /health/ready — readiness com checks de DB/Redis/externos
- GET /status — status + metadados de build/commit/uptime
- GET /.well-known/jwks.json — JWKS (chaves públicas para validação RS256)
- POST /oauth2/token — emissão de access token (client_credentials)
- GET /docs — documentação Swagger (se habilitada)
- GET /webhooks/catalog — catálogo de tipos de eventos e exemplos de payload

## Rodando localmente

```bash
# na raiz do monorepo
npm -w services/hrplus-api run dev
```

Tests e build:

```bash
npm -w services/hrplus-api test
npm -w services/hrplus-api run build
npm -w services/hrplus-api run lint
```

## Docker Compose (dev stack)

```bash
cd ../../
docker-compose up -d
```

Serviços:

- API: <http://localhost:3000>
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3002>
- Jaeger (UI): <http://localhost:16686>

Tracing OTLP está configurado para exportar para `http://jaeger:4318` dentro da rede do compose.

## Configuração

Variáveis de ambiente (exemplos):

- `OAUTH_PRIVATE_KEY` — chave privada PEM para assinar tokens RS256 (substitui JWT_SECRET quando presente)
- `OAUTH_PUBLIC_KEY` — chave pública PEM para validar tokens RS256
- `JWT_SECRET` — segredo JWT (fallback apenas quando não há par de chaves)
- `DATABASE_URL` — habilita Prisma e rotas administrativas
- `OTEL_ENABLED=true` — habilita tracing OpenTelemetry
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318` — endpoint OTLP/HTTP
- `SWAGGER_ENABLED=true` — habilita `/docs` (default)
- `MODULES_ENABLED`/`AI_ENABLED`/`COMPLIANCE_ENABLED` — habilitam rotas opcionais

### OAuth 2.1 / Escopos

- Fluxo suportado: `client_credentials` via `POST /oauth2/token`.
- Os tokens são assinados com RS256 quando `OAUTH_PRIVATE_KEY`/`OAUTH_PUBLIC_KEY` estão configuradas. Caso contrário, usa-se `JWT_SECRET` (HMAC) como fallback.
- Escopos são lidos da claim `scope` (string separada por espaço). Ex.: `"hr:read hr:write fin:transfer"`.
- As rotas usam um guardião de escopo. Exemplos práticos:
  - GET `/api/v1/hr/people` requer `hr:read`.
  - POST `/api/v1/hr/people` requer `hr:write`.
  - POST `/api/v1/fin/payments/transfer` requer `fin:transfer`.

JWKS disponível em `/.well-known/jwks.json` para consumidores validarem assinaturas RS256.

Clientes OAuth (client_credentials):

- Variável `OAUTH_CLIENTS` aceita um JSON de clients, ex.: `[{"id":"cli_123","secret":"sec_abc","scopes":["hr:read","fin:transfer"]}]`.
- Como fallback, use `OAUTH_CLIENT_ID` e `OAUTH_CLIENT_SECRET` (com `scopes=['*']`).

### Idempotência e Correlação

- Envie `Idempotency-Key` em POSTs críticos (ex.: criação de pessoas, transferências). Requisições repetidas com a mesma chave retornam a resposta original, com cabeçalho `Idempotency-Replayed: true`.
- `X-Correlation-Id` é aceito/propagado em todas as requests para rastreabilidade ponta-a-ponta.

### Gestão de Parceiros, Webhooks e Logs

Escopos:

- `partners:admin` — criar parceiros e rotacionar credenciais
- `partners:read` — listar parceiros/webhooks/logs
- `partners:webhooks` — registrar webhooks
- `partners:replay` — reprocessar entregas

Endpoints principais:

```http
POST /api/v1/partners                       # (partners:admin) cria parceiro e retorna clientId/secret + webhookSecret
GET  /api/v1/partners                       # (partners:read)  lista parceiros
POST /api/v1/partners/:id/rotate-credentials# (partners:admin) rotaciona clientSecret e webhookSecret
POST /api/v1/partners/:id/webhooks          # (partners:webhooks) registra endpoint e tipos de eventos
GET  /api/v1/partners/:id/webhooks          # (partners:read)    lista webhooks
GET  /api/v1/partners/:id/logs              # (partners:read)    lista entregas (status, tentativas, resposta)
POST /api/v1/partners/:id/webhooks/:deliveryId/replay # (partners:replay) reenvia uma entrega específica
```

Logs: filtros e paginação

- Endpoint: `GET /api/v1/partners/:id/logs`
- Query params suportados:
  - `status`: `queued` | `delivered` | `failed` | `all` (default: `all`)
  - `q`: busca textual (por `id`, `event`, `lastError`, `responseStatus`)
  - `from`: data/hora inicial (ISO 8601: `YYYY-MM-DDTHH:mm` ou `YYYY-MM-DDTHH:mm:ss.sssZ`)
  - `to`: data/hora final (mesmo formato do `from`)
  - `limit`: 1..500 (default: 200)
  - `offset`: >= 0 (default: 0)
  - `sort`: `asc` | `desc` (default: `desc`)
- Cabeçalhos de paginação na resposta:
  - `X-Total-Count`: total de registros que atendem ao filtro
  - `X-Result-Limit`: limite aplicado
  - `X-Result-Offset`: deslocamento aplicado
- Campos do item: `id`, `event`, `status`, `attempt`, `responseStatus?`, `responseBody?`, `lastError?`, `timestamp`.

Assinatura HMAC de Webhooks:

- Cabeçalhos:
  - `x-aurum-signature`: `t=<timestamp>,v1=<sha256_hmac>`
  - `x-aurum-timestamp`: `<timestamp_em_segundos>`
- String base: `<timestamp>.<body_json>` (mesma serialização enviada)
- Algoritmo: `HMAC-SHA256` com o `webhookSecret` do parceiro
- Tolerância sugerida: 5 minutos

### Sandbox (datasets, reset, eventos)

Escopos:

- `sandbox:manage` — listar datasets e resetar
- `sandbox:events` — disparar eventos sintéticos

Endpoints:

```http
GET  /sandbox/datasets       # (sandbox:manage) lista datasets disponíveis
POST /sandbox/reset          # (sandbox:manage) reset básico dos artefatos voláteis
POST /sandbox/events/:type   # (sandbox:events) dispara um evento (gera payload sintético se body vazio)
```

Eventos suportados (exemplos): `hr.person.created`, `fin.payment.created`, `partner.eligibility.completed`.


## Observabilidade

- Métricas: `/metrics` expõe registries do Prometheus com contadores e histogramas HTTP
- Tracing: inicializado em `src/tracing.ts` com auto-instrumentations e OTLP HTTP exporter

## Notas

- Em ambientes sem `DATABASE_URL`, o readiness reporta DB como `degraded` (não quebra a app)
- Filas BullMQ só são ativas se `QUEUE_ENABLED=true` (caso contrário usa no-op, evitando handles em testes)
