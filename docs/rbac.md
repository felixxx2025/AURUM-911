# RBAC / ABAC / Policies

## Roles

- SUPERADMIN
- TENANT_ADMIN
- HR_MANAGER
- PAYROLL_ADMIN
- HR_USER
- AUDITOR
- READONLY

## Exemplo ABAC

Se `resource == payroll_run` e `payroll_run.totals > 100000` → requer `PAYROLL_ADMIN` + aprovação de `TENANT_ADMIN`.

## Auditoria

Ações sensíveis (payroll pay, contract sign, data export) devem gerar registro imutável com assinatura append-only.
