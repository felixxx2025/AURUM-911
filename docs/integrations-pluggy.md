# Pluggy — Open Finance e Investimentos (Brasil)

Resumo: Agregador financeiro com foco em dados bancários e de investimentos, via consentimento do usuário.

## Escopo e casos de uso

- Conectar contas bancárias e de investimentos
- Extrair saldos, transações, posições
- Enriquecimento para análise de renda/risco

## Autenticação

- API Key/OAuth2 (conforme plano)
- Segredos em vault; rotacionar periodicamente

## Endpoints principais (exemplo)

- Criar/linkar conexão
- Listar contas/transações/posições
- Atualizações assíncronas via webhooks

## Webhooks

- Eventos: item.updated, transaction.created, holdings.updated (exemplos)
- Validar assinatura, timestamps e idempotência

## Sandbox e testes

- Ambiente de testes com instituições simuladas
- Dados de exemplo consistentes

## Erros e rate limits

- Tolerância a 429 e janelas de atualização
- Backoff exponencial e circuit breaker

## Mapping de campos (exemplo)

- Conta -> financialAccount
- Investimento -> holding (ticker, quantity, value)

## Checklist de compliance

- LGPD: consentimento e expiração
- Minimização e cifragem de PII

## Próximos passos

- Solicitar sandbox/credenciais
- Prototipar linkagem -> coleta -> webhook
- Normalizar schema de transações e holdings
