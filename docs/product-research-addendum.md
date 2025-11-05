# AURUM 911 — Product Research Addendum

Atualizado em: 2025-11-05

## 10) Cobertura atual vs. roadmap (checklist)

Status atual (nov/2025):

- [x] OAuth 2.1 (client_credentials), RS256, JWKS
- [x] Escopos/guardião de escopos por rota
- [x] Correlation-Id e Idempotency-Key ponta-a-ponta
- [x] Webhooks com HMAC (timestamp + assinatura) e replay
- [x] Portal do Parceiro (MVP avançado): chaves, webhooks, logs, filtros, paginação, CSV, sandbox e gráfico
- [x] Observabilidade (/metrics, /status, /health, /health/ready)
- [ ] Catálogo de eventos de negócio (proposal.*, contract.*, settlement.*) — publicar e versionar
- [ ] Fluxo de Simulação/Proposta (APIs, modelos, telas)
- [ ] KYC/Documentos (checklist + pendências)
- [ ] Assinatura eletrônica (e-sign)
- [ ] Liquidação/Repasse + Reconciliação
- [ ] Relatórios (funil, SLA, aging, financeiro)
- [ ] SDKs e Postman collection públicos
- [ ] Políticas de versionamento/depreciação e planos/comercial

Impacto/Esforço (sugestão próxima sprint):

- Alta prioridade: Simulação/Proposta, Catálogo de Eventos v1, Postman/SDKs
- Média prioridade: KYC/Docs (MVP), Assinatura simples, Relatórios funil/SLA
- Baixa prioridade inicial: Reconciliação completa, Pricing avançado

## 11) Conectores prioritários (próximos 30–60 dias)

- RH/ATS/KYC
  - [ ] SERPRO (documentos, validação CPF/CNPJ ampliada)
  - [ ] IDwall (biometria/liveness, KYC)
  - [ ] Kenoby (ATS) — status de contratação para onboarding
- Bancos/Financeiros
  - [ ] BACEN PIX (direto ou via PSP parceiro)
  - [ ] ZetraPay (gateway/pagamentos em lote)
  - [ ] Fireblocks (custódia), conforme estratégia fintech
- Assinatura e Documentos
  - [ ] Clicksign ou DocuSign (e-sign)
  - [ ] S3/Blob para armazenamento de documentos
- Mensageria/Comunicação
  - [ ] Twilio (SMS/WhatsApp) para pendências/documentos
  - [ ] SendGrid (email) com modelos transacionais

Cada conector deve ter: credenciais por tenant, testes de sandbox, mapeamento de campos e webhooks próprios (com verificações de segurança) documentados em `docs/integrations-*.md`.
