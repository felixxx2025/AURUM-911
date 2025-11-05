# @aurum-911/sdk (TypeScript)

SDK mínimo para integrar com a API AURUM-911 usando client_credentials e listar logs paginados de webhooks.

Requisitos: Node.js 18+ (fetch nativo).

## Instalação

Dentro do monorepo:

```bash
npm -w sdks/typescript run build
```

## Uso básico

```ts
import { AURUMClient } from '@aurum-911/sdk'

const client = new AURUMClient({ baseUrl: 'http://localhost:3000' })
await client.getToken({ clientId: 'cli_xxx', clientSecret: 'sec_xxx' })
const { items, total } = await client.listPartnerLogsPaged('par_123', { status: 'all', limit: 50 })
console.log(total, items.length)
```

## Roadmap do SDK

- Cobrir demais endpoints (parceiros, webhooks, sandbox)
- Tipagem completa dos modelos de domínio
- Publicação em registry privado/público
