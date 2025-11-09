# 🔌 Guia de Integração com Backend - AURUM HR System

## 📋 Visão Geral

Este documento descreve como integrar o frontend do sistema AURUM HR com um backend REST API.

## 🏗️ Estrutura de Arquivos

```
apps/web/
├── lib/api/
│   ├── client.ts          # Cliente HTTP configurado
│   └── hr-services.ts     # Serviços de API para módulos de RH
└── app/hr/
    ├── training/          # Página de Treinamentos
    ├── performance/       # Página de Avaliações
    ├── vacation/          # Página de Férias
    ├── payroll/           # Página de Folha de Pagamento
    ├── time/              # Página de Controle de Ponto
    ├── recruitment/       # Página de Recrutamento
    ├── benefits/          # Página de Benefícios
    └── reports/           # Página de Relatórios
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto web:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Para produção:

```env
NEXT_PUBLIC_API_URL=https://api.aurum.com.br/api
```

### 2. Autenticação

O cliente de API suporta autenticação via Bearer Token:

```typescript
import { apiClient } from '@/lib/api/client'

// Definir token após login
apiClient.setToken('seu-token-jwt')

// Limpar token após logout
apiClient.clearToken()
```

## 📡 Endpoints da API

### Treinamentos (`/hr/trainings`)

#### GET `/hr/trainings`
Lista todos os treinamentos

**Query Parameters:**
- `status` (opcional): `scheduled`, `in-progress`, `completed`
- `category` (opcional): `technical`, `soft-skills`, `compliance`, `leadership`

**Resposta:**
```json
[
  {
    "id": "1",
    "title": "Desenvolvimento Web Avançado com React",
    "category": "technical",
    "instructor": "Carlos Mendes",
    "duration": 40,
    "enrolledCount": 28,
    "capacity": 30,
    "status": "in-progress",
    "startDate": "2025-11-01",
    "completionRate": 65
  }
]
```

#### POST `/hr/trainings`
Cria um novo treinamento

**Body:**
```json
{
  "title": "Nome do Treinamento",
  "category": "technical",
  "instructor": "Nome do Instrutor",
  "duration": 40,
  "capacity": 30,
  "status": "scheduled",
  "startDate": "2025-12-01"
}
```

#### GET `/hr/trainings/:id`
Obtém detalhes de um treinamento específico

#### PUT `/hr/trainings/:id`
Atualiza um treinamento

#### DELETE `/hr/trainings/:id`
Remove um treinamento

---

### Avaliações de Desempenho (`/hr/performance`)

#### GET `/hr/performance`
Lista todas as avaliações

**Query Parameters:**
- `status` (opcional): `pending`, `in-progress`, `completed`, `approved`
- `department` (opcional): nome do departamento

**Resposta:**
```json
[
  {
    "id": "1",
    "employeeName": "Ana Silva",
    "department": "Tecnologia",
    "position": "Desenvolvedora Sênior",
    "reviewPeriod": "2º Semestre 2025",
    "reviewDate": "2025-11-01",
    "overallScore": 4.5,
    "status": "completed",
    "reviewer": "Carlos Mendes",
    "categories": {
      "technical": 4.8,
      "communication": 4.2,
      "leadership": 4.5,
      "productivity": 4.6
    }
  }
]
```

#### POST `/hr/performance`
Cria uma nova avaliação

#### GET `/hr/performance/:id`
Obtém detalhes de uma avaliação

#### PUT `/hr/performance/:id`
Atualiza uma avaliação

#### DELETE `/hr/performance/:id`
Remove uma avaliação

---

### Férias (`/hr/vacations`)

#### GET `/hr/vacations`
Lista todas as solicitações de férias

**Query Parameters:**
- `status` (opcional): `pending`, `approved`, `rejected`, `in-progress`, `completed`
- `type` (opcional): `annual`, `collective`, `medical`

**Resposta:**
```json
[
  {
    "id": "1",
    "employeeName": "Ana Silva",
    "department": "Tecnologia",
    "startDate": "2025-12-20",
    "endDate": "2026-01-05",
    "days": 15,
    "status": "approved",
    "requestDate": "2025-10-15",
    "approver": "Carlos Mendes",
    "type": "annual"
  }
]
```

#### POST `/hr/vacations`
Cria uma nova solicitação de férias

#### POST `/hr/vacations/:id/approve`
Aprova uma solicitação de férias

#### POST `/hr/vacations/:id/reject`
Rejeita uma solicitação de férias

**Body:**
```json
{
  "reason": "Motivo da rejeição"
}
```

---

### Outros Módulos

#### Folha de Pagamento (`/hr/payroll`)
- `GET /hr/payroll` - Lista folhas de pagamento
- `GET /hr/payroll/:id` - Detalhes de uma folha
- `POST /hr/payroll/process` - Processa nova folha

#### Controle de Ponto (`/hr/time`)
- `GET /hr/time` - Lista registros de ponto
- `POST /hr/time` - Registra ponto
- `PUT /hr/time/:id` - Atualiza registro

#### Recrutamento (`/hr/recruitment`)
- `GET /hr/recruitment` - Lista vagas
- `POST /hr/recruitment` - Cria nova vaga
- `PUT /hr/recruitment/:id` - Atualiza vaga

#### Benefícios (`/hr/benefits`)
- `GET /hr/benefits` - Lista benefícios
- `POST /hr/benefits` - Cria novo benefício
- `PUT /hr/benefits/:id` - Atualiza benefício

#### Relatórios (`/hr/reports`)
- `GET /hr/reports` - Lista relatórios disponíveis
- `POST /hr/reports/generate/:type` - Gera relatório
- `POST /hr/reports/schedule/:type` - Agenda relatório

## 💡 Exemplo de Uso

### Integrar serviços em uma página

```typescript
// app/hr/training/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { trainingService, Training } from '@/lib/api/hr-services'

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrainings()
  }, [])

  const loadTrainings = async () => {
    try {
      setLoading(true)
      const data = await trainingService.getAll()
      setTrainings(data)
    } catch (err) {
      setError('Erro ao carregar treinamentos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {trainings.map((training) => (
        <div key={training.id}>{training.title}</div>
      ))}
    </div>
  )
}
```

### Criar um novo registro

```typescript
const handleCreate = async () => {
  try {
    const newTraining = await trainingService.create({
      title: 'Novo Treinamento',
      category: 'technical',
      instructor: 'João Silva',
      duration: 20,
      enrolledCount: 0,
      capacity: 50,
      status: 'scheduled',
      startDate: '2025-12-01',
    })
    
    // Atualizar lista
    setTrainings([...trainings, newTraining])
  } catch (error) {
    console.error('Erro ao criar:', error)
  }
}
```

## 🔒 Tratamento de Erros

O cliente API já inclui tratamento básico de erros. Você pode adicionar mais lógica:

```typescript
try {
  const data = await trainingService.getAll()
} catch (error) {
  if (error.message.includes('401')) {
    // Redirecionar para login
    router.push('/auth/login')
  } else if (error.message.includes('404')) {
    // Recurso não encontrado
    setError('Dados não encontrados')
  } else {
    // Erro genérico
    setError('Erro ao carregar dados')
  }
}
```

## 📦 Estado Atual

**✅ Implementado:**
- Cliente HTTP configurado (`lib/api/client.ts`)
- Serviços de API para todos os módulos (`lib/api/hr-services.ts`)
- Tipagem TypeScript completa
- Suporte a autenticação Bearer Token
- Tratamento de erros básico

**🔄 Próximos Passos:**
1. Integrar serviços nas páginas (substituir mock data)
2. Adicionar React Query para cache e gerenciamento de estado
3. Implementar loading states e error boundaries
4. Adicionar retry logic e offline support
5. Implementar refresh token automático

## 🚀 Deploy

Para produção, certifique-se de:
1. Configurar `NEXT_PUBLIC_API_URL` corretamente
2. Implementar HTTPS
3. Configurar CORS no backend
4. Implementar rate limiting
5. Adicionar monitoring e logging

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do backend ou entre em contato com a equipe de desenvolvimento.
