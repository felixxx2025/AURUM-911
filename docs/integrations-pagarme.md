# Pagar.me — PSP/Adquirente (StoneCo)

Resumo: Pagamentos no Brasil com suporte a cartões, PIX e boletos; APIs amigáveis e foco em e-commerce.

## Escopo e casos de uso

- Cobrança cartão/PIX/boleto
- Assinaturas e split de pagamentos
- Reconciliação e estornos

## Autenticação

- API Key
- Segredos em vault e escopos mínimos

## Endpoints principais (exemplo)

- Criar transação/ordem
- Captura/estorno
- Gerenciar clientes e planos

## Webhooks

- Eventos: transaction.paid, transaction.refunded, subscription.updated (exemplos)
- Assinatura/HMAC (confirmar) e idempotência por eventId

## Sandbox e testes

- Ambiente sandbox com dados de teste
- Simulação de respostas via parâmetros

## Erros e rate limits

- Lidando com 4xx de validação e 5xx
- Retry/backoff e timeouts

## Mapping de campos (exemplo)

- Ordem -> transaction (amount, method)
- Liquidação -> settlement/charge status

## Checklist de compliance

- PCI (via tokenização)
- LGPD: reduzir PII; logs mínimos

## Próximos passos

- Solicitar credenciais sandbox
- Prototipar cartão/PIX + webhook
- Estrutura de split (se aplicável)
