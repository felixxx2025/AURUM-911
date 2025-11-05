# Celcoin — Infraestrutura Financeira/PIX

Resumo: Infraestrutura financeira com serviços de pagamentos, PIX e correspondentes bancários.

## Escopo e casos de uso

- Iniciação/recebimento via PIX
- Pagamentos de contas/boletos
- Carteiras e cash-in/out

## Autenticação

- OAuth2/JWT (varia por produto)
- mTLS em rotas sensíveis

## Endpoints principais (exemplo)

- Criar cobrança/QR PIX
- Pagar boleto/conta
- Extratos e conciliação

## Webhooks

- Eventos: pix.received, payment.completed (exemplos)
- Assinatura HMAC; idempotência por eventId

## Sandbox e testes

- Ambiente de homologação e QRs de teste
- Simulação de devoluções

## Erros e rate limits

- 4xx/5xx com retry/backoff e CB
- Timeouts e detecção de falhas

## Mapping de campos (exemplo)

- Cobrança -> charge (txid, amount, payer)
- Pagamento -> payment (amount, barcode, status)

## Checklist de compliance

- LGPD, requisitos BACEN
- Logs de auditoria

## Próximos passos

- Solicitar sandbox e documentação atual
- Prototipar PIX -> webhook -> reconciliação
- Monitorar latência e taxa de sucesso
