# Épico — Assinatura Eletrônica

Objetivo: permitir assinatura de documentos (contratos, termos) com múltiplos signatários e trilha de auditoria.

## Critérios de aceite

- Upload/iniciação de fluxo de assinatura
- Webhooks de status (started/completed/failed)
- Download do documento final e certificado
- Observabilidade: tempo de conclusão, taxa de falhas

## Milestones

1. Sandbox (Clicksign/DocuSign) e protótipo
2. Webhooks inbound com verificação de assinatura
3. UI mínima no Portal para acompanhar status
4. Retenção/armazenamento seguro de documentos

## Dependências

- Padrões legais (eIDAS/ESIGN/UETA quando aplicável)
- Política de armazenamento/criptografia de documentos
