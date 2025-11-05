# Segurança e Compliance por Conector

Este guia consolida políticas e parâmetros mínimos para operar integrações com segurança e conformidade regulatória.

## Princípios

- Mínimo necessário: escopos e permissões por conector, segregados por ambiente e tenant.
- Segredos gerenciados: rotacionar chaves periodicamente; usar KMS (ex.: AWS KMS, GCP KMS) e seal de Vault onde aplicável.
- Assinatura e verificação: todos os webhooks com HMAC (ou mTLS/OAuth quando suportado). Rejeitar requisições sem assinatura válida.
 - Assinatura e verificação: todos os webhooks com HMAC (ou mTLS/OAuth quando suportado). Rejeitar requisições sem assinatura válida.
   - Formato padrão AURUM para webhooks: header `x-aurum-signature` com `t=<unix_ts>,v1=<hmac_sha256>` e base de assinatura `${t}.${payload_json}` (UTF-8)
   - Exigir verificação com `timingSafeEqual` e clock skew aceitável configurável por provedor
- Idempotência: chave `Idempotency-Key` para chamadas ativas; deduplicação de webhooks por `event_id` + janela.
- Observabilidade: métricas, trilhas de auditoria e correlação ponta-a-ponta (`X-Correlation-Id`).
- Privacidade: retenção mínima, anonimização/pseudonimização de PII, e DPA com provedores.

## Parâmetros por conector (padrão)

- Clicksign (E‑sign)
  - Webhooks: HMAC com header `x-aurum-signature` (t=TS, v1=HMAC)
  - Retenção de documentos: 180 dias (configurável por contrato)
  - Dados sensíveis: criptografar PDFs em repouso, uso de presigned URLs
- Stripe/Adyen/Pagar.me (PIX/Cartão)
  - Webhooks: HMAC (Stripe) / RSA (Adyen) / assinatura via secret (Pagar.me)
  - PCI DSS: não armazenar PAN/CVV; usar tokens
  - Reversões/chargebacks: logs imutáveis e reconciliação assíncrona
- Belvo/Pluggy/Quanto (Open Finance)
  - Consentimento: TTL 90 dias; escopos mínimos
  - Dados bancários: mascarar e agregar antes de persistir
  - Retenção de transações: 12 meses (revisar com LGPD)
- Idwall/Serpro (KYC)
  - Imagens/documentos: criptografia em repouso; descarte após verificação
  - Logs: sem PII desnecessária; anonimizar identificadores

## Controles

- Env vars por conector
  - `AURUM_INTEGRATIONS_<PROVIDER>_WEBHOOK_SECRET`
  - `AURUM_INTEGRATIONS_<PROVIDER>_API_KEY`
  - `AURUM_INTEGRATIONS_<PROVIDER>_ENDPOINT`
- Headers padrões
  - `X-Correlation-Id` obrigatória
  - `User-Agent: AURUM-911/<serviço>`
- Respostas a incidentes
  - Playbooks em `docs/runbooks.md`
  - Alarms: taxa de falhas de verificação de assinatura > 1% em 5m

## DPA e Residência de Dados

- Formalizar DPA por provedor; listar subprocessadores
- Preferir regiões BR/LatAm para dados financeiros quando disponível
- Limitar exportações cross-border conforme base legal

---

Revisão trimestral destes parâmetros e auditorias de acessos/segredos recomendadas.
