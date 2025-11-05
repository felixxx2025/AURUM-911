# QI Tech — Infraestrutura de Crédito

Resumo: Plataforma para originação/registro/cessão de crédito e serviços auxiliares.

## Escopo e casos de uso

- Simulação e proposta de crédito
- Formalização e registro
- Liquidação e acompanhamento

## Autenticação

- OAuth2/JWT (conforme documentação)
- mTLS para integrações sensíveis

## Endpoints principais (exemplo)

- Simular/gerar proposta
- Formalizar contrato
- Registrar e liquidar

## Webhooks

- Eventos: proposal.updated, contract.signed, settlement.processed (exemplos)
- Assinatura HMAC e idempotência por eventId

## Sandbox e testes

- Ambiente de homologação com dados sintéticos
- Cenários de aprovação/reprovação

## Erros e rate limits

- Tratar 4xx de validação e 5xx; retries controlados
- Circuit breaker e timeouts

## Mapping de campos (exemplo)

- Proposta -> proposal (amount, term, rate)
- Contrato -> contract (status, signatures)

## Checklist de compliance

- LGPD e requisitos regulatórios (BACEN)
- Trilhas de auditoria e retenção mínima

## Próximos passos

- Solicitar credenciais e escopos
- Prototipar simulação -> proposta -> formalização
- Definir reconciliação e relatórios
