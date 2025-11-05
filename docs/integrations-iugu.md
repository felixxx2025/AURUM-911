# Iugu — Cobranças e Assinaturas

Resumo: Plataforma brasileira para cobranças, assinaturas e PIX; foco em recorrência e faturas.

## Escopo e casos de uso

- Criar cobranças e assinaturas
- Emissão de boletos/PIX
- Gestão de clientes e faturas

## Autenticação

- API Token
- Segredo em vault; acessos restritos

## Endpoints principais (exemplo)

- Charges/Invoices
- Subscriptions
- Customers/Payment Methods

## Webhooks

- Eventos: invoice.paid, invoice.canceled, subscription.suspended (exemplos)
- Validar assinatura (quando disponível) e idempotência

## Sandbox e testes

- Ambiente de testes
- Cenários de pagamento/estorno

## Erros e rate limits

- 4xx/5xx com backoff e CB
- Mapeamento de motivos de falha

## Mapping de campos (exemplo)

- Fatura -> invoice (status, dueDate, total)
- Assinatura -> subscription (planId, status)

## Checklist de compliance

- PCI por tokenização
- LGPD: dados mínimos e mascaramento

## Próximos passos

- Provisionar sandbox
- Prototipar assinatura + webhook de pagamento
- Reconciliação básica
