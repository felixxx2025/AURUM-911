# Dock — Banking as a Service

Resumo: Plataforma de BaaS para contas, cartões e pagamentos com infraestrutura regulatória.

## Escopo e casos de uso

- Abertura e gestão de contas
- Emissão de cartões e transações
- Pagamentos e liquidação

## Autenticação

- OAuth2/JWT (varia por produto)
- mTLS e segregação por ambiente

## Endpoints principais (exemplo)

- Criar/gerenciar contas
- Emissão/gestão de cartões
- Transações e extratos

## Webhooks

- Eventos: account.updated, card.transaction.created, settlement.posted (exemplos)
- Assinatura HMAC; idempotência por eventId

## Sandbox e testes

- Ambiente de homologação
- Dados sintéticos e testes de carga (quando aplicável)

## Erros e rate limits

- Tratamento de validação (4xx) e indisponibilidade (5xx)
- Retry/backoff e CB

## Mapping de campos (exemplo)

- Conta -> account (balance, status)
- Transação -> ledgerEntry (amount, type, merchant)

## Checklist de compliance

- Requisitos regulatórios (BACEN)
- LGPD e segregação de dados por tenant

## Próximos passos

- Definir produto/escopo com time comercial
- Solicitar sandbox e documentação específica
- Prototipar conta -> cartão -> transação
