# Épico — PSP/PIX

Objetivo: processar cobranças PIX e cartões com reconciliação e webhooks confiáveis.

## Critérios de aceite

- Criar cobranças (PIX) e sessões de pagamento
- Receber/validar webhooks (assinatura, timestamp, idempotência)
- Reconciliação por txid/endToEndId/reference
- Observabilidade: latência, taxa de aprovação, chargebacks

## Milestones

1. Sandbox (Stripe/Adyen/Pagar.me) + PIX
2. Webhooks inbound e reconciliação básica
3. Estornos/devoluções e relatórios
4. Painel de acompanhamento

## Dependências

- Política PCI (tokenização; sem armazenar PAN/CVV)
- Integração com módulo financeiro interno
