# Clicksign — Integração de Assinatura Eletrônica

Resumo: Assinatura de documentos com validade jurídica no Brasil. APIs e webhooks maduros, foco em contratos de RH/finanças.

## Escopo e casos de uso

- Assinatura de contratos de admissão e aditivos
- Assinatura de termos e políticas internas
- Fluxos de múltiplos signatários e ordem de assinatura

## Autenticação

- API Key/Bearer Token (confirmar no onboarding)
- Recomendações: usar secret no vault, rotacionar periodicamente

## Endpoints principais (exemplo)

- Criar documento/upload
- Criar fluxo de assinatura (signatários, ordem, métodos de autenticação)
- Consultar status do documento/assinaturas
- Baixar comprovante/arquivo final

Observação: validar limites de tamanho, tipos de arquivo e requisitos de hash.

## Webhooks

- Eventos: document.created, signing.started, signing.completed, signing.failed, document.finalized
- Segurança: assinatura HMAC (verificar cabeçalho e base string)
- Recomendações: validar assinatura, idempotência, retries com backoff

## Sandbox e testes

- Ambiente de testes com usuários fictícios
- Dados de exemplo e webhooks direcionados a endpoint de staging

## Erros e rate limits

- Mapear códigos (4xx/5xx), mensagens e políticas de retry
- Definir circuit breaker e timeouts

## Mapping de campos (exemplo)

- Pessoa/colaborador -> signatário (nome, email, CPF)
- Template de contrato -> documento
- Status de assinatura -> estados internos (pendente, em andamento, concluído)

## Checklist de compliance

- LGPD: minimização de dados e finalidade clara
- Armazenamento seguro de documentos e logs de auditoria

## Próximos passos

- Solicitar credenciais de sandbox e documentação atualizada
- Prototipar fluxo: upload -> iniciar assinatura -> webhook -> download
- Criar feature flag para rollout gradual
