#!/bin/bash

echo "🚀 Configurando AURUM-911 para aurum.cool"

# Criar diretório para certificados Let's Encrypt
mkdir -p letsencrypt

# Configurar permissões
chmod 600 letsencrypt

# Parar containers existentes
echo "📦 Parando containers existentes..."
docker-compose down

# Construir imagens
echo "🔨 Construindo imagens..."
docker-compose build

# Iniciar serviços
echo "🌟 Iniciando serviços..."
docker-compose up -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços..."
sleep 30

# Verificar status
echo "✅ Verificando status dos serviços..."
docker-compose ps

echo ""
echo "🎉 AURUM-911 configurado para aurum.cool!"
echo ""
echo "📋 URLs disponíveis:"
echo "   🌐 Frontend: https://aurum.cool"
echo "   🔧 API: https://api.aurum.cool"
echo "   📊 Grafana: https://grafana.aurum.cool"
echo "   🔍 Jaeger: https://jaeger.aurum.cool"
echo "   📈 Prometheus: https://prometheus.aurum.cool"
echo "   🚦 Traefik: https://traefik.aurum.cool"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Configure DNS para apontar aurum.cool para este servidor"
echo "   2. Aguarde propagação DNS (pode levar até 24h)"
echo "   3. Certificados SSL serão gerados automaticamente"
echo ""