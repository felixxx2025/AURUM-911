# idwall — KYC e Verificação de Identidade

Resumo: Verificação de identidade, background check e validações documentais.

## Escopo e casos de uso

- KYC de pessoa física (documentos + liveness)
- Validação de dados cadastrais
- Sinalização de risco/PEP quando aplicável

## Autenticação

- API Key / OAuth2 (confirmar no onboarding)
- Segredos em vault; escopo mínimo

## Endpoints principais (exemplo)

- Criar verificação KYC (documento + selfie)
- Consultar status/resultado da verificação
- Obter relatórios de background

## Webhooks

- Eventos: verification.completed, verification.failed (exemplos)
- Validar assinatura; idempotência por id da verificação

## Sandbox e testes

- Ambiente de testes com documentos de exemplo
- Simulação de outcomes (aprovado, reprovado, inconclusivo)

## Erros e rate limits

- Tratar 4xx/5xx com backoff e retries limitados
- Timeouts e circuit breaker

## Mapping de campos (exemplo)

- Pessoa -> subject (nome, CPF, data de nascimento)
- Resultado -> status interno (aprovado, reprovado, manual)

## Checklist de compliance

- LGPD: sensibilidade de dados biométricos; base legal explícita
- Criptografia em trânsito e em repouso

## Próximos passos

- Solicitar sandbox/credenciais
- Prototipar upload -> verificação -> webhook -> decisão
- Definir janelas de retenção de dados
