# Observability & Security

- Logs: Loki (estruturados por tenant_id, trace_id)
- Métricas: Prometheus (RPS, p95 latency, error rate) por serviço e tenant
- Tracing: OpenTelemetry (propaga x-trace-id)
- Auditoria: append-only signed
- PII: criptografar CPF, dados bancários com chave por tenant (Key Vault/HSM)
- eSocial/gov: retries com DLQ, UI de correção manual
- Data access review: relatório mensal exportável (AUDITOR)
- Fraud detection: Helios ML para mudanças incomuns em payroll
