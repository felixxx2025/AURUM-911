# Integrações — Parceiros (Zetra Consig, ConsigaMais, ZetraPay e outros)

Este documento descreve payloads, endpoints internos e mapeamentos por parceiro.

## Zetra Consig

- Elegibilidade: `POST /api/v1/partners/zetra-consig/eligibility`
- Consignação: `POST /api/v1/partners/zetra-consig/consign-apply`

Exemplo request elegibilidade:
```json
{
  "tenant_id":"<uuid>",
  "employee": {"cpf":"11122233344","name":"Fulano","salary":4200.00,"company_cnpj":"00011122233344"},
  "requested_amount": 1000.00,
  "term": 12
}
```
Exemplo resposta:
```json
{"eligible": true, "maxAmount":1200.00, "fee": 25.00, "margin_after": 5.2}
```

## ConsigaMais

- Verificação de margem/eligibility: `POST /api/v1/partners/consigamais/eligibility`
- Solicitação de adiantamento: `POST /api/v1/partners/consigamais/advance`

Fluxo (alto nível): request → eligibility → confirmation → payroll reserve → FinSphere payment → payroll deduction.

## ZetraPay (gateway)

- Transferência de pagamentos em lote (via FinSphere): `POST /api/v1/fin/payments/transfer`

Exemplo request:
```json
{
  "tenant_id":"<uuid>",
  "payment_batch_id":"<runId>",
  "transfers":[{"to_account":"BR1234","amount":1000.00,"reference":"adv-123"},{"to_account":"BR2345","amount":50.00,"reference":"tax-123"}]
}
```
Resposta:
```json
{"status":"accepted","batch_id":"..."}
```

## Outros conectores

- Kenoby (ATS), Fireblocks (custódia cripto), Serpro/IDwall (KYC/valid.
) Mapear via `/partners/{id}/integration-setup` com API keys, webhook e field mapping por tenant.

## Catálogo de Conectores

- Assinatura eletrônica:
  - [Clicksign](integrations-clicksign.md)
  - [DocuSign](integrations-docusign.md)

- Open Finance / Agregadores:
  - [Belvo](integrations-belvo.md)
  - [Quanto](integrations-quanto.md)
  - [Pluggy](integrations-pluggy.md)

- PSP/PIX/Pagamentos:
  - [Stripe](integrations-stripe.md)
  - [Adyen](integrations-adyen.md)
  - [Pagar.me](integrations-pagarme.md)
  - [Iugu](integrations-iugu.md)
  - [Gerencianet (Efí)](integrations-gerencianet.md)

- Core Banking / Infra Financeira:
  - [Dock](integrations-dock.md)
  - [FitBank](integrations-fitbank.md)
  - [Celcoin](integrations-celcoin.md)
  - [QI Tech](integrations-qitech.md)

- KYC / Verificação de Identidade:
  - [idwall](integrations-idwall.md)
  - [SERPRO](integrations-serpro.md)

- Antifraude:
  - [ClearSale](integrations-clearsale.md)

- Mensageria / Email:
  - [Zenvia](integrations-zenvia.md)
  - [SendGrid](integrations-sendgrid.md)

## Validação opcional de eventos (inbound)

A API aplica validação Zod opcional para eventos conhecidos por provider+type. Quando o tipo declarado no payload não possui contrato cadastrado, o webhook é aceito sem validação de schema.

Eventos atualmente registrados:

- clicksign: `signing.completed`
- stripe: `payment_intent.succeeded`
- belvo: `transaction.created`
- adyen: `adyen.notification`
- pagarme: `transaction.paid`
- idwall: `report.finished`
- gupy: `candidate.created`
- zenvia: `message.received`
- sendgrid: `email.processed`
- docusign: `envelope.completed`
- dock: `transaction.settled`
- celcoin: `pix.received`
- gerencianet: `pix.received`
- fitbank: `transaction.completed`
- iugu: `invoice.paid`
- pluggy: `transaction.created`
- qitech: `proposal.approved`
- quanto: `connection.updated`
- serpro: `query.completed`
- clearsale: `analysis.completed`
