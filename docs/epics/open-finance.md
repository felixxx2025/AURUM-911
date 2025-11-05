# Épico — Open Finance

Objetivo: habilitar consentimento e coleta de dados financeiros (saldos, transações, investimentos) para scoring e elegibilidade.

## Critérios de aceite

- Consentimento via provedor (Belvo/Quanto/Pluggy)
- Coleta inicial e incremental de transações
- Webhooks de atualização validados (assinatura + idempotência)
- Observabilidade: latência, taxa de sucesso, erros por instituição

## Milestones

1. Sandbox + fluxos básicos de consentimento
2. Coleta de contas/saldos/transações + normalização
3. Webhooks e reconciliação incremental
4. Dashboards de métricas (coleta/erros)

## Dependências

- Definição de modelos de dados normalizados (transactions/accounts)
- Políticas de retenção e anonimização de PII
