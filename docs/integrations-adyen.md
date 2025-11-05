# Adyen — Adquirência Global e PIX

Resumo: Plataforma global de pagamentos com suporte multi-canal (cartões, PIX no BR), alta disponibilidade e webhooks robustos.

## Escopo e casos de uso

- Pagamentos com cartões e PIX
- Antifraude nativa e SCA/3DS
- Liquidação, reembolsos e reconciliação

## Autenticação

- API Key + Webhook HMAC; OAuth2 opcional em alguns fluxos
- Segredos em vault; rotação e princípio do menor privilégio

## Endpoints principais (exemplo)

- Payments (autorização/captura)
- Refunds e ajustes
- Checkout (Drop-in/Components)

## Webhooks

- Eventos: AUTHORISATION, REFUND, CANCELLATION, CHARGEBACK (exemplos)
- Assinatura HMAC; validar timestamps e replays
- Idempotência via referência e chaves de request

## Sandbox e testes

- Ambiente de teste com cartões/PIX de exemplo
- Mock de eventos e replays via painel

## Erros e rate limits

- Tratar declines específicos (códigos) e 5xx
- Retry/backoff e circuit breaker

## Mapping de campos (exemplo)

- Pedido -> payment (amount, currency, reference)
- Resultado -> paymentStatus (authorised, refused, pending)

## Checklist de compliance

- PCI DSS; nunca armazenar PAN/CVV
- LGPD: mascarar PII em logs

## Próximos passos

- Configurar merchant account e credenciais
- Prototipar cartão/PIX + webhook de liquidação
- Mapear chargebacks e reconciliação
