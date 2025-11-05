#!/bin/bash

set -e

echo "🚀 AURUM-911 Production Deployment"

# Verificar variáveis obrigatórias
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "❌ NEXT_PUBLIC_API_URL é obrigatória"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL é obrigatória"
    exit 1
fi

# Carregar ambiente de produção
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Build das imagens
echo "🔨 Building production images..."
docker-compose -f docker-compose.yml build --no-cache

# Executar migrações
echo "📊 Running database migrations..."
docker-compose run --rm api npm run prisma:migrate:deploy

# Deploy com zero downtime
echo "🌟 Deploying services..."
docker-compose up -d --remove-orphans

# Health check
echo "🏥 Health checking..."
sleep 30

# Verificar API
if curl -f -s "https://api.aurum.cool/health" > /dev/null; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    exit 1
fi

# Verificar Frontend
if curl -f -s "https://aurum.cool" > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "🎉 Production deployment successful!"
echo "🌐 Frontend: https://aurum.cool"
echo "🔧 API: https://api.aurum.cool"