# AURUM HR+ (HumanFlow)

Documento canônico com páginas, endpoints, modelos de dados, fluxos críticos e integrações.

## Páginas (rotas UI)

- /auth/login, /auth/tenant-lookup, /auth/forgot-password, /auth/verify-otp
- /dashboard (widgets: headcount, payroll cost MTD, cashflow forecast, alerts compliance, onboarding pipeline, churn risk)
- People: /hr/people/list, /hr/people/{employeeId}/profile, /hr/people/{employeeId}/actions, /hr/people/import
- Payroll: /hr/payroll/calendar, /hr/payroll/run, /hr/payroll/{runId}/detail, /hr/payroll/reports/taxes, /hr/payroll/payments, /hr/payroll/advances
- Time: /hr/time/punch, /hr/time/schedule, /hr/time/approvals, /hr/time/analytics
- Recruitment: /hr/recruitment/jobs, /hr/recruitment/pipeline/{jobId}, /hr/recruitment/candidate/{id}, /hr/recruitment/offer
- Benefits: /hr/benefits/catalog, /hr/benefits/enroll, /hr/benefits/claims, /hr/benefits/partners
- Performance & Learning: /hr/performance/okrs, /hr/performance/reviews, /hr/learning/courses
- Compliance & Documents: /hr/compliance/documents, /hr/compliance/audit, /hr/compliance/esocial
- Analytics (VisionX): /hr/analytics/overview, /hr/analytics/custom, /hr/analytics/alerting
- Partner Portal: /partners/list, /partners/{id}/integration-setup, /partners/{id}/onboarding, /partners/{id}/contracts

## Endpoints REST (exemplos)

Autenticação & Tenant

- POST /api/v1/auth/login
- POST /api/v1/tenant/provision (internal)

People

- GET /api/v1/hr/people?filter...
- GET /api/v1/hr/people/{employeeId}
- POST /api/v1/hr/people
- PUT /api/v1/hr/people/{employeeId}
- POST /api/v1/hr/people/import

Payroll

- POST /api/v1/hr/payroll/run
- GET /api/v1/hr/payroll/{runId}/report
- POST /api/v1/hr/payroll/{runId}/approve
- POST /api/v1/hr/payroll/{runId}/pay

Time

- POST /api/v1/hr/time/punch
- GET /api/v1/hr/time/{employeeId}

Recruitment

- POST /api/v1/hr/recruitment/jobs
- POST /api/v1/hr/recruitment/candidates
- POST /api/v1/hr/recruitment/{candidateId}/stage

Benefits

- GET /api/v1/hr/benefits/catalog
- POST /api/v1/hr/benefits/enroll
- POST /api/v1/hr/benefits/claim

Partners

- POST /api/v1/partners/{partnerId}/test-connection
- POST /api/v1/partners/zetra-consig/consign-apply

## Modelos SQL (essenciais)

Veja `docs/sql-models.md` com tabelas: tenants, employees, payroll_runs, time_punches, partners.

## Workflows críticos

- Onboarding Zetra Consig (sandbox → production, contratos, webhooks, playbooks de reconciliação)
- Adiantamento Salarial ConsigaMais (eligibility → reserve → pay → payroll deduction)

## RBAC/ABAC

- Roles: SUPERADMIN, TENANT_ADMIN, HR_MANAGER, PAYROLL_ADMIN, HR_USER, AUDITOR, READONLY.
- Exemplo ABAC: se payroll_run.totals > 100000 → exigir PAYROLL_ADMIN e aprovação TENANT_ADMIN.

## Observability & Security

- Audit trails, eSocial retries, PII encryption (Vault), data access review, fraud detection (Helios ML).

## Dashboards (VisionX)

- HR+ widgets: headcount, turnover, time-to-hire, payroll cost MTD, bank of hours, requisitions, compliance alerts.
