# Quanto — Open Finance (Brasil)

Resumo: Plataforma de Open Finance para consentimento e agregação de dados financeiros.

## Escopo e casos de uso

- Consentimento e linkagem de contas
- Coleta de saldos, transações e dados de crédito
- Insights para elegibilidade/score

## Autenticação

- OAuth2 (confirmação no onboarding)
- Segredos em vault; rotação e audit trail

## Endpoints principais (exemplo)

- Criar/gerenciar consentimentos
- Listar contas/saldos/transações
- Eventos de atualização de dados

## Webhooks

- Eventos: consent.updated, account.updated, transaction.created (exemplos)
- Assinatura: validar assinatura/timestamps
- Idempotência por eventId

## Sandbox e testes

- Ambiente de testes com dados sintéticos
- Simulação de janelas de atualização

## Erros e rate limits

- Backoff em 429 e tolerância a picos
- Circuit breaker e timeouts

## Mapping de campos (exemplo)

- Conta -> financialAccount
- Transação -> transaction (amount, merchant, category)

## Checklist de compliance

- LGPD: consentimento granular e expiração
- Registros de auditoria de acessos

## Próximos passos

- Solicitar sandbox e documentos
- Prototipar consent -> coleta -> webhook
- Normalizar esquema de transações
