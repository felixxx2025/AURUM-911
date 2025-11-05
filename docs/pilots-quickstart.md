# Pilotos – Quickstart

Este guia explica como acionar os pilotos de E‑sign (Clicksign), PIX (Stripe) e Open Finance (Belvo) e como visualizar os webhooks recebidos.

## Pré‑requisitos

- API em execução (serviço `hrplus-api`).
- Portal (Next.js) em execução para usar a UI de Conectores (opcional).
- Variáveis de ambiente (opcional) para assinar webhooks simulados:
  - `AURUM_INTEGRATIONS_CLICKSIGN_WEBHOOK_SECRET`
  - `AURUM_INTEGRATIONS_STRIPE_WEBHOOK_SECRET`
  - `AURUM_INTEGRATIONS_BELVO_WEBHOOK_SECRET`

## Endpoints dos pilotos

- E‑sign (Clicksign)
  - `POST /pilot/e-sign/clicksign/start` body: `{ "documentId": "doc-123" }`
  - `GET /pilot/e-sign/clicksign/{id}/status`
- PIX (Stripe)
  - `POST /pilot/payments/stripe/pix-charge` body: `{ "amount": 101, "currency": "BRL" }`
  - `GET /pilot/payments/charge/{id}`
- Open Finance (Belvo)
  - `POST /pilot/open-finance/belvo/consent` body: `{ "userId": "user-123" }`
  - `GET /pilot/open-finance/consent/{id}`

Após ~300ms de cada ação, a API dispara um webhook inbound assinado (se o secret estiver definido) para `/integrations/webhooks/{provider}`.

## Visualização de logs e estatísticas

- `GET /integrations/webhooks/logs?provider=clicksign|stripe|belvo&limit=50`
- `GET /integrations/webhooks/stats` – agregados por provider (total, verificados, não verificados)

## Portal – Conectores

Acesse a página `Conectores` e use as abas:
- Webhooks: enviar payload de teste HMAC e ver logs. A seção exibe KPIs agregados (total, verificados, não verificados) e uma tabela por provider. Os KPIs atualizam automaticamente a cada 10s.
- Piloto E‑sign, PIX e Open Finance: iniciar fluxos e ver status. Os webhooks serão registrados automaticamente.

## Observações

- Armazenamento de status/logs é em memória para os pilotos (sem DB). Para produção, habilitar persistência via Prisma/PostgreSQL e deduplicação por `event_id`.
- A verificação de payload (Zod) é aplicada opcionalmente para provedores conhecidos e retorna 400 quando inválido. A lista de eventos suportados está em `docs/integrations.md` (seção "Validação opcional de eventos").
