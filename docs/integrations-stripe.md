# Stripe — Pagamentos e PIX

Resumo: Plataforma global de pagamentos com suporte a cartões, PIX (no Brasil), webhooks robustos e excelente documentação.

## Escopo e casos de uso

- Cobrança via cartão/PIX
- Subscrições e faturas
- Reembolsos e reconciliação

## Autenticação

- API Key (secret/public), modo test/live
- Armazenar segredo com rotação periódica

## Endpoints principais (exemplo)

- Criar PaymentIntent / Charge
- Criar/gerenciar Checkout Sessions
- Subscriptions e Invoices

## Webhooks

- Eventos: payment_intent.succeeded, charge.refunded, invoice.paid (exemplos)
- Assinatura: validar cabeçalho de assinatura (secret do endpoint)
- Idempotência: usar Idempotency-Key nos POSTs

## Sandbox e testes

- Modo test com cartões/PIX de exemplo
- Replay de eventos via painel

## Erros e rate limits

- Tratar 402/4xx específicos (declines) e 5xx
- Retry/backoff e circuit breaker

## Mapping de campos (exemplo)

- Ordem interna -> PaymentIntent/Checkout Session
- Status de pagamento -> estados internos (pendente, pago, falhou)

## Checklist de compliance

- PCI DSS (tokenização e nunca armazenar dados sensíveis)
- LGPD: minimizar PII e mascarar dados em logs

## Próximos passos

- Habilitar PIX no projeto
- Prototipar fluxo de pagamento -> webhook -> reconciliação
- Criar mapeamento de erros de cartão/PIX
