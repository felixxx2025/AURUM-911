# DocuSign — Assinatura Eletrônica (Global)

Resumo: Plataforma líder global em assinatura eletrônica com APIs maduras e webhooks confiáveis.

## Escopo e casos de uso

- Assinatura de contratos com múltiplos signatários
- Templates e regras de roteamento
- Certificados e trilhas de auditoria

## Autenticação

- OAuth2 (JWT Grant ou Authorization Code)
- Segregação de ambientes (demo/prod) e escopos mínimos

## Endpoints principais (exemplo)

- Criar envelope (documentos + destinatários)
- Enviar/acompanhar status do envelope
- Baixar documentos e certificado de conclusão

## Webhooks

- Connect: envelope-completed, recipient-completed, envelope-declined
- Assinatura/validação de mensagens (HMAC/secret)
- Idempotência e reentregas

## Sandbox e testes

- Ambiente demo com usuários e exemplos
- Simulação de eventos de conclusão/recusa

## Erros e rate limits

- 4xx/5xx com retry/backoff
- Circuit breaker e timeouts

## Mapping de campos (exemplo)

- Pessoa -> recipient (name, email)
- Documento -> envelope/document (templateId, tabs)

## Checklist de compliance

- eIDAS/ESIGN/UETA quando aplicável
- LGPD: redução de PII e cifragem de documentos

## Próximos passos

- Solicitar conta demo e credenciais OAuth
- Prototipar upload -> envio -> webhook -> download
- Configurar retenção e políticas de acesso
