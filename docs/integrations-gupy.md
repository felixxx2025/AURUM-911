# Gupy (Kenoby) — ATS (Recrutamento)

Resumo: Integração com plataforma de vagas/candidatos para sincronizar pipelines de recrutamento.

## Escopo e casos de uso

- Listar vagas e sincronizar candidaturas
- Atualizar status de candidato no pipeline
- Importar dados para dossiê do colaborador

## Autenticação

- API Key/OAuth (confirmar no onboarding)
- Segredos em vault; escopos mínimos necessários

## Endpoints principais (exemplo)

- Listar vagas e candidatos
- Atualizar status/etapa do candidato
- Obter anexos (CVs) e notas

## Webhooks

- Eventos: candidate.created, candidate.stage_changed (exemplos)
- Validar assinatura do provedor e timestamps
- Idempotência por deliveryId/eventId

## Sandbox e testes

- Ambiente de testes/staging
- Dados de vaga/candidato de exemplo

## Erros e rate limits

- Padrões 4xx/5xx e backoff
- Circuit breaker e timeouts

## Mapping de campos (exemplo)

- Candidato -> person (nome, email, telefone)
- Etapa -> stage/status interno (screening, entrevista, oferta)

## Checklist de compliance

- LGPD: consentimento e retenção mínima de dados candidatos
- Anonimização para relatórios

## Próximos passos

- Solicitar sandbox/credenciais
- Prototipar import incremental de candidatos
- Mapear etapas para estados internos
