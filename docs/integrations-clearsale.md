# ClearSale — Antifraude

Resumo: Análise de risco de fraude para transações e cadastros.

## Escopo e casos de uso

- Score de risco em transações/contas
- Sinais comportamentais e device fingerprint
- Regras e revisão manual

## Autenticação

- API Key/OAuth (conforme plano)
- Segredos em vault e escopos mínimos

## Endpoints principais (exemplo)

- Enviar transação/ordem para análise
- Consultar decisão/score
- Gerenciar regras e listas

## Webhooks

- Eventos: decision.updated, review.required (exemplos)
- Assinatura HMAC e idempotência por eventId

## Sandbox e testes

- Dados de teste e simulação de cenários
- Ajuste de regras e thresholds

## Erros e rate limits

- Backoff em 429/5xx; timeouts e CB
- Tratamento de inconsistências de payload

## Mapping de campos (exemplo)

- Transação -> fraudAssessment (amount, channel, device)
- Decisão -> status interno (aprovado, negado, manual)

## Checklist de compliance

- Minimização de PII; mascaramento de dados
- Logs de auditoria e explicabilidade

## Próximos passos

- Habilitar sandbox
- Prototipar envio/consulta + webhook de decisão
- Ajustar features e thresholds por segmento
