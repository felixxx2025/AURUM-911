#!/bin/bash
set -e

VERSION=${1:-latest}
NAMESPACE="aurum-911"

echo "🚀 Deploying AURUM-911 v$VERSION"

# Build images
echo "📦 Building Docker images..."
docker build -t aurum-911/api:$VERSION ./services/hrplus-api
docker build -t aurum-911/web:$VERSION ./apps/web

# Push to registry
echo "📤 Pushing to registry..."
docker tag aurum-911/api:$VERSION $REGISTRY_URL/aurum-911/api:$VERSION
docker tag aurum-911/web:$VERSION $REGISTRY_URL/aurum-911/web:$VERSION
docker push $REGISTRY_URL/aurum-911/api:$VERSION
docker push $REGISTRY_URL/aurum-911/web:$VERSION

# Deploy to Kubernetes
echo "☸️ Deploying to Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/hpa.yaml

# Wait for rollout
echo "⏳ Waiting for deployment..."
kubectl rollout status deployment/aurum-api -n $NAMESPACE

echo "✅ Deployment completed successfully!"