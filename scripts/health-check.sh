#!/bin/bash

echo "🏥 AURUM-911 Health Check"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para verificar serviço
check_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null); then
        if [ "$response" -eq "$expected_status" ]; then
            echo -e "${GREEN}✅ OK${NC} ($response)"
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} ($response)"
            return 1
        fi
    else
        echo -e "${RED}❌ UNREACHABLE${NC}"
        return 1
    fi
}

# Verificar serviços
echo "🔍 Checking services..."
echo

failed=0

# API Health
check_service "API Health" "https://api.aurum.cool/health" || ((failed++))

# Frontend
check_service "Frontend" "https://aurum.cool" || ((failed++))

# Grafana
check_service "Grafana" "https://grafana.aurum.cool/api/health" || ((failed++))

# Prometheus
check_service "Prometheus" "https://prometheus.aurum.cool/-/healthy" || ((failed++))

# Jaeger
check_service "Jaeger" "https://jaeger.aurum.cool/" || ((failed++))

# Traefik Dashboard
check_service "Traefik" "https://traefik.aurum.cool/api/rawdata" || ((failed++))

echo
echo "📊 Health Check Summary:"
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed service(s) failed health check${NC}"
    exit 1
fi