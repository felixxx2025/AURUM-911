# AURUM 911 — Pesquisa de Produto e Gap Analysis

Atualizado em: 2025-11-04

## 1) Sumário executivo

O AURUM 911 posiciona-se como um hub de integrações para RH/benefícios com foco em consignado/folha: API unificada (HRPlus), painel web e app mobile. Em comparação com líderes de mercado (fintechs de consignado, bancos com APIs, hubs de integrações), a proposta é sólida tecnicamente, porém carece de “camadas de produto” orientadas a adesão, monetização e experiência do parceiro/usuário final.

Principais oportunidades de curto prazo:

- Definir fluxos completos de negócio (do lead à liquidação), incluindo simulação, proposta, KYC/documentos, assinatura, liquidação e reconciliação.
- Portal do Parceiro (onboarding, chaves, sandbox, limites, relatórios) e catálogo de webhooks/eventos.
- Políticas de versionamento/depreciação e oferta de SDKs + Postman para acelerar integrações.
- Métricas/KPIs de produto e planos comerciais claros (tiers, limites, preços).

## 2) Personas e Jobs-To-Be-Done (JTBD)

- Gestor de Parcerias (fintech/banco): “Quero integrar rapidamente para lançar um produto de consignado sem travar em burocracia.”
- Operador de Backoffice (RH/folha): “Preciso acompanhar solicitações, status e conciliações sem retrabalho.”
- Desenvolvedor Parceiro: “Preciso entender a API, testar em sandbox e ir para produção com confiança.”
- Compliance/Financeiro: “Quero trilhas de auditoria, reconciliação e relatórios consistentes.”

## 3) Paisagem competitiva (arquetipos)

- Fintechs de Consignado/Correspondentes Digitais: foco em originação (simulação → proposta → contrato), operações digitais e experiência do parceiro.
- Bancos/Emissores com APIs: exigem conformidade elevada (FAPI/OAuth2.1, mTLS), forte governança de versionamento e sandbox.
- Hubs/Plataformas de RH/Financeiras: vendem conectividade + operação (dashboards, relatórios, conciliações, alertas) e DX (SDKs, Portal Dev).

## 4) Benchmark de funcionalidades (produto)

Essenciais no mercado:

- Elegibilidade e Simulação: regras de margem, taxas, prazos, CET, parcelas; simulação antes da proposta.
- Gestão de Propostas: criação, atualização, aprovação, pendências; status granulares.
- KYC/Documentos: coleta orientada (document checklist), OCR, validação (liveness, biometria quando aplicável).
- Assinatura de Contrato: e-sign (assinatura eletrônica) e registro de aceite.
- Liquidação e Repasse: agendamento, conciliação e relatórios financeiros.
- Webhooks/Eventos: catálogo claro, assinatura segura e replay.
- Portal do Parceiro: chaves, sandbox, limites, logs, relatórios, replays de webhook.
- Relatórios/Analytics: funil (simulação→proposta→contrato→liquidação), inadimplência, SLA.
- Suporte/Operação: runbooks, status page e comunicação de incidentes.

Itens diferenciadores (nice-to-have que viram diferencial):

- Pré-aprovação com simulação em lote; importação CSV/planilha.
- Dispute/chargeback operacional (pendências, reenvio de docs, reconsideração).
- Feature flags e AB tests de política de crédito.
- Relatórios executivos (coorte, conversão por canal, receitas compartilhadas).

## 5) O que falta no AURUM 911 (ângulo de produto)

- Fluxo fim-a-fim do consignado: simulação → proposta → KYC/documentos → assinatura → liquidação → reconciliação.
- Catálogo de Webhooks com semântica de negócio (proposal.created, proposal.updated, contract.signed, settlement.posted...).
- Portal do Parceiro/Desenvolvedor: chaves, sandbox, logs, limites, replays, relatórios.
- Modelos de dados e telas para propostas/contratos/documentos e pendências.
- Relatórios operacionais e financeiros (funil, conversão, aging, conciliação).
- Políticas de produto: versionamento/depreciação, limites/quotas, planos/tier e preços.

## 6) Roadmap sugerido (0–30–60–90 dias)

0–30 dias (MVP+)

- Simulação + Proposta: endpoints e telas básicas; status padronizados.
- Webhooks v1 + assinatura HMAC; eventos de proposta/contrato.
- Portal Parceiro (MVP): chaves, sandbox, visualização de logs.
- Postman collection + exemplos end-to-end; guia de onboarding.

31–60 dias

- KYC/documentos com checklist e pendências; assinatura eletrônica básica.
- Relatórios operacionais (funil, SLA) e reconciliação inicial.
- SDKs (TS/Python) gerados do OpenAPI; API Explorer simples.
- Políticas: versionamento/depreciação e rate limits por plano.

61–90 dias

- Liquidação e repasse + relatórios financeiros; reconciliação completa.
- Portal Parceiro avançado: replays de webhook, analytics, alertas.
- Status page/API e SLOs públicos; NPS e feedback in‑product.
- Experimentos (AB/feature flags) em regras de elegibilidade/simulação.

## 7) Métricas/KPIs de produto

- Adoção: nº parceiros ativos, tempo de integração (lead→go‑live), uso sandbox→produção.
- Conversão: taxa proposta→contrato; taxa simulação→proposta; abandono por etapa.
- Qualidade: P95 de tempo de simulação/proposta; taxa de pendência documental resolvida em <48h.
- Receita: volume contratado, receita por parceiro, churn/expansão.
- Sucesso do cliente: NPS, CES (esforço), tempo para primeira transação (TTFT).

## 8) Packaging e preços (sugestão)

- Starter (até X transações/mês, limite de webhooks): ideal para POCs.
- Growth (limites maiores, suporte comercial, acesso a relatórios operacionais).
- Enterprise (SLOs customizados, suporte dedicado, mTLS, RBAC avançado, metering/quotas sob demanda).

Critérios de precificação: volume de propostas/contratos, nº de integrações ativas, SLAs, recursos premium (replays, analytics avançado).

## 9) Próximos passos práticos

- Especificar e publicar: docs/api-standards.md, docs/webhooks.md, docs/sandbox.md, docs/deprecation-policy.md (produto + DX).
- Adicionar endpoints e telas para: simulação, proposta, documentos/KYC, assinatura, liquidação e reconciliação (MVP+).
- Lançar Portal do Parceiro (MVP): chaves, sandbox, logs, limites; e evoluir gradualmente.
- Publicar Postman collection e exemplos completos; abrir canal de suporte/parcerias.

—
Anexo A (rascunho de eventos de negócio)

- proposal.created | proposal.updated | proposal.approved | proposal.rejected
- document.requested | document.received | document.rejected
- contract.signed | contract.canceled
- settlement.scheduled | settlement.posted | settlement.reconciled
