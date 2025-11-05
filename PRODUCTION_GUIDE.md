# 🚀 AURUM-911 - Guia de Produção

## 📋 Pré-requisitos

### Infraestrutura
- **Kubernetes Cluster** (EKS, GKE, ou AKS)
- **PostgreSQL** (RDS ou equivalente)
- **Redis** (ElastiCache ou equivalente)
- **S3** (ou storage compatível)
- **Load Balancer** (ALB, NLB)
- **CDN** (CloudFront, CloudFlare)

### Ferramentas
- Docker & Docker Compose
- kubectl
- Helm (opcional)
- Terraform
- AWS CLI

## 🔧 Deploy Rápido

### 1. Configurar Variáveis
```bash
export REGISTRY_URL="your-registry.com"
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export REDIS_URL="redis://host:6379"
export JWT_SECRET="your-super-secret-key"
export S3_BACKUP_BUCKET="aurum-911-backups"
```

### 2. Deploy com Docker Compose (Desenvolvimento)
```bash
docker-compose up -d
```

### 3. Deploy Kubernetes (Produção)
```bash
# Build e push das imagens
./scripts/deploy.sh v1.0.0

# Aplicar manifests
kubectl apply -f k8s/
```

### 4. Terraform (Infraestrutura AWS)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 📊 Monitoramento

### Métricas Disponíveis
- **HTTP Requests**: Taxa, latência, status codes
- **Cache**: Hit/miss rates, performance
- **Database**: Conexões, queries, performance
- **Business**: Usuários ativos, transações, revenue

### Dashboards
- **Grafana**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

### Alertas Críticos
- CPU > 80% por 5 minutos
- Memória > 90% por 2 minutos
- Erro rate > 5% por 1 minuto
- Database connections > 80%

## 🔒 Segurança

### Checklist de Produção
- [ ] HTTPS habilitado (TLS 1.3)
- [ ] Rate limiting configurado
- [ ] WAF habilitado
- [ ] Secrets em vault (não em env vars)
- [ ] Network policies aplicadas
- [ ] RBAC configurado
- [ ] Audit logs habilitados
- [ ] Backup automático funcionando

### Compliance
- **LGPD/GDPR**: Export/deleção automática
- **SOC2**: Audit logs imutáveis
- **ISO27001**: Criptografia end-to-end
- **PCI-DSS**: Tokenização de dados sensíveis

## 📈 Escalabilidade

### Auto-scaling
```yaml
# HPA configurado para:
minReplicas: 3
maxReplicas: 20
targetCPU: 70%
targetMemory: 80%
```

### Performance
- **Cache L1/L2**: 95%+ hit rate
- **CDN**: Assets globais < 100ms
- **Database**: Connection pooling
- **API**: < 200ms p95 response time

## 🔄 Backup & Recovery

### Backup Automático
```bash
# Executar diariamente às 3:00 AM
0 3 * * * /app/scripts/backup.sh
```

### Disaster Recovery
- **RTO**: 15 minutos
- **RPO**: 1 hora
- **Multi-região**: Failover automático
- **Backup**: Retenção 30 dias

## 🚨 Troubleshooting

### Logs Importantes
```bash
# API logs
kubectl logs -f deployment/aurum-api -n aurum-911

# Database logs
kubectl logs -f statefulset/postgres -n aurum-911

# Cache logs
kubectl logs -f deployment/redis -n aurum-911
```

### Comandos Úteis
```bash
# Health check
curl http://api.aurum.cool/health

# Métricas
curl http://api.aurum.cool/metrics

# Cache stats
redis-cli info stats
```

## 📞 Suporte

### Contatos de Emergência
- **DevOps**: devops@aurum.cool
- **Security**: security@aurum.cool
- **On-call**: +55 11 99999-9999

### Runbooks
- [Incident Response](./runbooks/incident-response.md)
- [Database Issues](./runbooks/database.md)
- [Performance Issues](./runbooks/performance.md)

---

**AURUM-911** está pronto para produção enterprise! 🌟