# SERPRO — Validações Oficiais (CPF/CNPJ/CNH)

Resumo: Serviços governamentais para validação de dados oficiais (Brasil).

## Escopo e casos de uso

- Validação de CPF/CNPJ
- Consulta CNH e outros cadastros
- Compliance/KYC básico

## Autenticação

- OAuth2 / Certificados (varia por serviço)
- mTLS quando aplicável; guarda segura de chaves

## Endpoints principais (exemplo)

- Validação CPF/CNPJ
- Consulta de documentos/cadastros

## Webhooks

- Normalmente não há webhooks
- Usar correlação/trace com X-Correlation-Id

## Sandbox e testes

- Ambientes de homologação (quando disponíveis)
- Dados de teste limitados

## Erros e rate limits

- Tratamento de indisponibilidade intermitente
- Retentativas com backoff e circuit breaker

## Mapping de campos (exemplo)

- Pessoa jurídica/física -> registro oficial (situação, nome, data)

## Checklist de compliance

- Base legal LGPD (obrigação legal/interesse legítimo)
- Registro de auditoria de consultas

## Próximos passos

- Habilitar acesso e contratar serviços necessários
- Prototipar validação de CPF/CNPJ
- Monitoramento de disponibilidade
