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
