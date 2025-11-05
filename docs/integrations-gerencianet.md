# Gerencianet (Efí) — PIX/Emissor

Resumo: Emissor e PSP com foco em PIX e cobranças no Brasil.

## Escopo e casos de uso

- Cobranças PIX (imediatas e dinâmicas)
- Webhooks de confirmação
- Reconciliação

## Autenticação

- OAuth2 com certificados (mTLS)
- Guardar chave privada/CRT em vault

## Endpoints principais (exemplo)

- Criar cobrança PIX (cob/qrCode)
- Consultar status e recebimentos
- Devolução (refund)

## Webhooks

- Eventos: pix.received, cob.status_changed (exemplos)
- Validação de assinatura e idempotência por txid

## Sandbox e testes

- Ambiente de homologação com certificados de teste
- QRs estáticos/dinâmicos

## Erros e rate limits

- 4xx (validação/credenciais) e 5xx
- Retry/backoff, timeouts e CB

## Mapping de campos (exemplo)

- Cobrança -> charge (txid, location, amount)
- Recebimento -> settlement (endToEndId, amount)

## Checklist de compliance

- Requisitos BACEN e segurança de certificados
- LGPD: dados transacionais mínimos

## Próximos passos

- Solicitar credenciais/certificados de sandbox
- Prototipar cobrança PIX + webhook de recebimento
- Reconciliação por txid e endToEndId
