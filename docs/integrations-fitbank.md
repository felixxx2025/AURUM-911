# FitBank — Infraestrutura Financeira

Resumo: Plataforma de serviços financeiros (contas, pagamentos, PIX) para empresas.

## Escopo e casos de uso

- Contas de pagamento e carteiras
- PIX, TED/DOC (quando aplicável)
- Reconciliação de recebíveis

## Autenticação

- OAuth2/JWT (varia por produto)
- mTLS para rotas sensíveis

## Endpoints principais (exemplo)

- Criar/gerenciar contas
- Iniciar pagamentos/transferências
- Consultar extratos e saldos

## Webhooks

- Eventos: payment.completed, pix.received (exemplos)
- Assinatura HMAC e idempotência

## Sandbox e testes

- Ambiente de homologação
- Dados/QRs de exemplo

## Erros e rate limits

- Backoff em 429/5xx, CB, timeouts
- Mapeamento de códigos/erros de negócio

## Mapping de campos (exemplo)

- Conta -> account (holder, document, balance)
- Pagamento -> payment (amount, type, status)

## Checklist de compliance

- LGPD + requisitos BACEN
- Criptografia em trânsito/repouso

## Próximos passos

- Solicitar sandbox/credenciais
- Prototipar PIX -> webhook -> reconciliação
- Métricas de latência e sucesso
