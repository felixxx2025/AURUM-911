# Runbooks & Onboarding

## Onboarding Tenant

1. POST /api/v1/tenant/provision { name, cnpj, plan, modules, branding }
2. Criar schema/records padrão, roles, usuário admin
3. Configurar subdomínio e branding
4. Validar login SSO/MFA, RBAC aplicado

## Onboarding Parceiro (ex.: Zetra Consig)

1. `/partners/onboarding` → dados da empresa e keys sandbox
2. Criar registro `partner` e status `sandbox_ready`
3. Executar `/sandbox/zetra-consig/simulate` e validar testes
4. Aprovação de contrato e SLA → `production_pending`
5. Provisionar keys de produção, configurar webhooks e mapping
6. Enviar webhook de teste e validar reconciliação (Helios playbook)

## Incidentes comuns

- Falha no pagamento (ZetraPay): verificar batch_id e reconciliação
- Erro eSocial: reprocessar evento com correção manual
- Latência elevada: checar p95 por serviço e dependências externas
