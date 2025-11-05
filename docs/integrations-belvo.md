# Belvo — Integração Open Finance (Brasil)

Resumo: Agregação financeira (contas, transações, investimentos) via consentimento; forte para enriquecimento de dados e scoring financeiro.

## Escopo e casos de uso

- Linkagem de contas e consentimento do usuário
- Consulta de saldos, transações, e dados de renda
- Enriquecimento de dados para elegibilidade de crédito

## Autenticação

- OAuth2 / API Key (confirmar no onboarding)
- Manter segredos em vault e rotacionar periodicamente

## Endpoints principais (exemplo)

- Criar/gerenciar consentimentos
- Obter contas, saldos, transações e investimentos
- Webhooks de atualizações de dados

## Webhooks

- Eventos: account.updated, transaction.created, consent.revoked (exemplos)
- Segurança: validar assinatura do provedor e timestamps
- Idempotência: usar chave única por evento

## Sandbox e testes

- Ambiente de testes com dados sintéticos
- Templates de contas e transações de exemplo

## Erros e rate limits

- Tratar 4xx/5xx com backoff exponencial
- Implementar circuit breaker e timeouts

## Mapping de campos (exemplo)

- Conta -> financialAccount (bank, type, number)
- Transação -> transaction (amount, currency, description, categories)

## Checklist de compliance

- LGPD: consentimento explícito e finalidade
- Armazenamento mínimo necessário; logs pseudonimizados

## Próximos passos

- Solicitar credenciais de sandbox
- Prototipar consent -> fetch transações -> webhook de atualização
- Feature flag para rollout gradual
