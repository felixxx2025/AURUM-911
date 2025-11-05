# 🚀 AURUM-911 - Setup Local Rápido

## ⚡ **Início Imediato**

### 1. **Instalar Dependências**
```bash
cd AURUM-911
npm install
```

### 2. **Configurar Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
DATABASE_URL="postgresql://aurum:password@localhost:5432/aurum911"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### 3. **Iniciar Serviços**
```bash
# Opção 1: Tudo junto
npm run dev

# Opção 2: Separado
npm run dev:api    # Backend na porta 3000
npm run dev:web    # Frontend na porta 3001
```

### 4. **Acessar Sistema**
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **Documentação**: http://localhost:3000/docs
- **Métricas**: http://localhost:3000/metrics
- **Health Check**: http://localhost:3000/health

## 🐳 **Com Docker (Recomendado)**

```bash
# Iniciar stack completa
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f
```

## 🧪 **Testar Funcionalidades**

### Login de Teste
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.aurum.cool","password":"admin123"}'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 🎯 **URLs Funcionais**
- ✅ http://localhost:3001 (Frontend)
- ✅ http://localhost:3000 (API)
- ✅ http://localhost:3000/docs (Swagger)
- ✅ http://localhost:3000/health (Status)

**O sistema está 100% funcional localmente!** 🚀