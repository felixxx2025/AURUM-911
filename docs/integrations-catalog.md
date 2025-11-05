# Catálogo de Integrações — Parceiros, Fintechs, Bancos e Serviços

Este documento lista potenciais conectores por categoria (Brasil e globais), com notas rápidas para priorização, due diligence e próximos passos.

## Como priorizar (scorecard)

Para cada conector, avalie:

- Valor para o produto (H/M/L)
- Esforço de integração (H/M/L)
- APIs e segurança: REST/GraphQL, OAuth2/JWT/HMAC/mTLS, webhooks
- Sandbox/ambiente de testes e documentação
- SLAs, rate limits e suporte
- Compliance e residência de dados (LGPD/GDPR/PCI/SOC2)
- Comercial (pricing/transacional, setup, lock-in)

Campos sugeridos na planilha: provider, categoria, região, auth, webhooks, sandbox, SLA, pricing, rate limit, compliance, data residency, prioridade, dono, status, notas.

---

## KYC/Identidade e Documentos (Brasil)

- unico (Acesso Digital) — biometria/liveness, captura de documentos
- idwall — verificação de identidade e background check
- Serasa Experian — dados cadastrais, score (atenção a compliance)
- Boa Vista — dados e score de crédito
- SERPRO — validações oficiais (CPF/CNPJ, CNH etc.)

Globais:

- Trulioo, Onfido, Sumsub — KYC global (documentos + liveness)

## Fraud/AML

- ClearSale (inclui ex-Konduto) — antifraude comportamental
- ComplyAdvantage — AML, listas de sanções/PEP
- Feedzai, Riskified (globais) — antifraude avançado

## Open Finance / Data Aggregation (Brasil)

- Belvo — Open Finance + data enrichment
- Quanto — Open Finance, consent e dados bancários
- Pluggy — agregação financeira e investimentos

## Bancos, PSPs, PIX e Pagamentos

- Stripe — cartões, PIX, webhooks; docs/sandbox excelentes
- Adyen — adquirência global, PIX, alta sofisticação técnica
- Pagar.me (StoneCo) — adquirente/PSP com PIX
- Iugu — cobranças, assinaturas, PIX
- Gerencianet (Efí) — emissor/PSP com PIX
- Cielo, Rede (Itaú), Getnet — adquirentes tradicionais

## Core Banking / Crédito (Infra)

- QI Tech — infraestrutura de crédito, registros (atenção a compliance)
- Dock — banking as a service (contas, cartões)
- FitBank, Celcoin, S3 Bank, Pomelo — infraestrutura financeira

## E‑signature / Contratos

- Clicksign — foco Brasil, APIs e webhooks
- DocuSign — líder global, ampla documentação
- Adobe Sign — alternativa enterprise

## RH/ATS (Recrutamento) e Folha

- Gupy (inclui Kenoby) — ATS
- SAP SuccessFactors, Workday, Oracle Taleo — enterprise ATS/HR (globais)
- Senior Sistemas, TOTVS (RM/Protheus), ADP, LG Lugar de Gente — folha (atenção: muitas vezes sem APIs públicas; integração via SFTP/arquivos)

## Mensageria e Email

- Twilio, Sinch — SMS/WhatsApp
- Zenvia — mensageria Brasil
- SendGrid, Amazon SES, Mailgun — email transacional

## Storage / Arquivos

- AWS S3, Azure Blob Storage, GCP Cloud Storage — armazenamento de documentos e anexos

## Observabilidade e Auditoria

- Sentry — erros cliente/servidor
- Datadog, New Relic — APM/infra
- Elastic — logs e busca

---

## Top 10 para 30–60–90 dias (sugestão)

- 30 dias: Clicksign, Belvo, Stripe (PIX), Gupy (ATS), SERPRO
- 60 dias: Adyen (ou Pagar.me), idwall, Zenvia/Twilio, SendGrid
- 90 dias: QI Tech (crédito), ClearSale, integração mínima com folha (Senior/TOTVS) via SFTP

Critérios: priorize APIs com webhooks e sandbox, alto impacto em onboarding (assinatura, KYC) e monetização (pagamentos/PIX/Open Finance).

---

## Próximos passos (operacional)

- Criar um arquivo por conector: `docs/integrations-<provider>.md` com:
  - Escopo e casos de uso
  - Autenticação (OAuth2/JWT/HMAC) e endpoints
  - Webhooks: eventos, validação de assinatura
  - Sandbox: como habilitar e dados de teste
  - Erros e rate limits
  - Matriz de campos (mapping) e exemplos de payload
- Abrir épicos/tickets por categoria com score (valor x esforço) e dependências legais/comerciais.

---

## Observações legais/compliance

- Garanta base legal LGPD para cada dado sensível (minimização e finalidade)
- Avalie DPAs, residência de dados e due diligence de segurança (SOC2/ISO)
- Evite lock-in: desenhe camada de abstração e mapeamento de campos
