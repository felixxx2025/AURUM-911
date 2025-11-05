# SendGrid — Email Transacional

Resumo: Plataforma de email transacional com templates e métricas de entregabilidade.

## Escopo e casos de uso

- Envio de emails transacionais (notificações, confirmação, reset de senha)
- Templates dinâmicos e personalização
- Métricas de entrega/abertura

## Autenticação

- API Key
- Segredo em vault; permissões reduzidas

## Endpoints principais (exemplo)

- Send Mail (v3)
- Template management
- Suppression groups

## Webhooks

- Eventos: processed, delivered, open, click, bounce, spamreport
- Assinatura: validação de assinatura do Event Webhook
- Idempotência por event_id

## Sandbox e testes

- Modo sandbox e caixas de teste
- Replay de eventos via painel

## Erros e rate limits

- Mapear 4xx (policy/rejeições) e 5xx
- Retry com backoff e circuit breaker

## Mapping de campos (exemplo)

- Email -> notification (to, subject, templateId)
- Eventos -> emailEvent (type, timestamp, userAgent)

## Checklist de compliance

- SPF/DKIM/DMARC
- LGPD: não logar conteúdo sensível

## Próximos passos

- Provisionar domínio autenticado
- Prototipar envio + webhook de eventos
- Quarentena de bounces e lista de supressão
