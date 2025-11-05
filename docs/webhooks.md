# Webhooks — Catálogo, Segurança e Boas Práticas

Este documento descreve os eventos de negócio publicados pela plataforma, o mecanismo de segurança (HMAC), exemplos de payloads e diretrizes de versionamento.

## Segurança (HMAC)

- Assinatura: `HMAC-SHA256` usando o `webhookSecret` do parceiro
- Cabeçalhos enviados:
  - `x-aurum-signature`: `t=<timestamp>,v1=<sha256_hmac>`
  - `x-aurum-timestamp`: `<timestamp_em_segundos>`
- Base string: `<timestamp>.<body_json>` (a mesma serialização enviada no corpo)
- Tolerância sugerida de relógio: 5 minutos
- Recomendação: recuse entregas onde `|now - x-aurum-timestamp| > 300s` e quando a assinatura não confere; faça retry idempotente no seu lado

## Eventos de negócio (v1)

Nomenclatura: `dominio.recurso.acao` (ex.: `hr.person.created`).

### HR

- `hr.person.created`
- `hr.person.updated`

Payload (exemplo):

```json
{
  "event": "hr.person.created",
  "data": {
    "id": "per_123",
    "first_name": "Alice",
    "last_name": "Silva",
    "email": "alice.silva@example.com"
  },
  "id": "deliv_abc",
  "createdAt": "2025-11-05T12:34:56.000Z"
}
```

### Financeiro

- `fin.payment.created`
- `fin.payment.failed`

Payload (exemplo):

```json
{
  "event": "fin.payment.created",
  "data": {
    "id": "pay_123",
    "amount": 1200.5,
    "currency": "BRL",
    "status": "created"
  },
  "id": "deliv_def",
  "createdAt": "2025-11-05T12:34:56.000Z"
}
```

### Parceiros (elegibilidade)

- `partner.eligibility.completed`

Payload (exemplo):

```json
{
  "event": "partner.eligibility.completed",
  "data": {
    "id": "elig_123",
    "eligible": true,
    "maxAmount": 1500.0,
    "margin_after": 4.2
  },
  "id": "deliv_xyz",
  "createdAt": "2025-11-05T12:34:56.000Z"
}
```

## Entrega e retries

- A plataforma tenta entregar e registra `status`, `attempt`, `responseStatus` e `lastError` nos logs
- Replays podem ser acionados manualmente via `POST /api/v1/partners/:id/webhooks/:deliveryId/replay`
- Parceiros devem enviar HTTP 2xx para confirmar recebimento; outros status são considerados falha

## Versionamento

- Versão do catálogo: `v1`
- Mudanças compatíveis (ex.: adicionar campos) podem ocorrer sem version bump
- Mudanças incompatíveis serão anunciadas e versionadas (ex.: `v2`) com política de depreciação documentada

## Segurança adicional (opcional)

- mTLS, allowlist de IPs, e tokens verificados por JWKS do parceiro podem ser configurados por acordo bilateral

## Sandbox

- Dispare eventos de teste com `POST /sandbox/events/:type`
- Se nenhum corpo for enviado, um payload sintético é gerado
- Veja também `docs/product-research-addendum.md` para prioridades de conectores
