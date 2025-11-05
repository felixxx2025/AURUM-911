# Zenvia — Mensageria (SMS/WhatsApp)

Resumo: Plataforma de mensageria brasileira para SMS/WhatsApp; suporte a templates e webhooks de entrega.

## Escopo e casos de uso

- Envio de SMS e WhatsApp para notificações transacionais
- Templates aprovados e tracking de entrega
- Two-way messaging (quando aplicável)

## Autenticação

- API Key/Bearer
- Segredos em vault; rotação periódica

## Endpoints principais (exemplo)

- Enviar mensagem SMS/WhatsApp
- Consultar status/relatórios
- Gerenciar templates/campanhas

## Webhooks

- Eventos: message.delivered, message.failed, inbound.message (exemplos)
- Validar assinatura/cabecalhos e timestamps
- Idempotência por messageId

## Sandbox e testes

- Ambiente de testes limitado
- Simulação de status de entrega

## Erros e rate limits

- Tratamento de 4xx/5xx e backoff exponencial
- Circuit breaker e timeouts

## Mapping de campos (exemplo)

- Mensagem -> notification (to, channel, body, template)
- Delivery -> deliveryLog (status, errorCode)

## Checklist de compliance

- Opt-in/opt-out e políticas de privacidade
- LGPD: minimização e retenção

## Próximos passos

- Solicitar credenciais
- Prototipar envio e webhook de entrega
- Métrica de entregabilidade por canal
