# 🌐 AURUM-911 - Configuração de DNS

## 🎯 **Problema Identificado**
O domínio `aurum.cool` não está configurado/registrado.

## 🔧 **Soluções Imediatas**

### 1. **Para Desenvolvimento Local**
```bash
# Adicionar ao /etc/hosts (Linux/Mac) ou C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 aurum.cool
127.0.0.1 api.aurum.cool
127.0.0.1 demo.aurum.cool
127.0.0.1 app.aurum.cool
```

### 2. **URLs Alternativas para Teste**
- **Frontend**: `http://localhost:3001`
- **Backend API**: `http://localhost:3000`
- **Docs**: `http://localhost:3000/docs`
- **Metrics**: `http://localhost:3000/metrics`

### 3. **Configuração Docker Compose**
```yaml
# Adicionar ao docker-compose.yml
services:
  web:
    ports:
      - "80:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000
  
  api:
    ports:
      - "3000:3000"
    environment:
      - CORS_ORIGIN=http://localhost
```

## 🚀 **Para Produção**

### 1. **Registrar Domínio**
- Comprar `aurum.cool` em registrador (Namecheap, GoDaddy, etc.)
- Ou usar domínio alternativo: `aurum911.com`, `aurumplatform.com`

### 2. **Configurar DNS Records**
```
A     aurum.cool           → IP_DO_SERVIDOR
A     api.aurum.cool       → IP_DO_SERVIDOR  
A     app.aurum.cool       → IP_DO_SERVIDOR
A     *.aurum.cool         → IP_DO_SERVIDOR (wildcard)
CNAME www.aurum.cool       → aurum.cool
```

### 3. **SSL/TLS Certificate**
```bash
# Usando Let's Encrypt
certbot --nginx -d aurum.cool -d *.aurum.cool
```

## 🔄 **Configuração Temporária**

### Usar ngrok para teste público:
```bash
# Terminal 1 - API
cd services/hrplus-api
npm run dev

# Terminal 2 - Frontend  
cd apps/web
npm run dev

# Terminal 3 - Tunnel público
ngrok http 3000 --subdomain=aurum-api
ngrok http 3001 --subdomain=aurum-app
```

## ⚡ **Início Rápido Local**

```bash
# 1. Clonar e instalar
git clone <repo>
cd AURUM-911
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com configurações locais

# 3. Iniciar desenvolvimento
npm run dev

# 4. Acessar
# Frontend: http://localhost:3001
# API: http://localhost:3000
# Docs: http://localhost:3000/docs
```

## 🎯 **Status Atual**
- ✅ **Código**: 100% completo e funcional
- ⚠️ **DNS**: Precisa configuração de domínio
- ✅ **Local**: Funciona perfeitamente em localhost
- ✅ **Deploy**: Pronto para produção