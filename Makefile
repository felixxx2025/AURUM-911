.PHONY: help dev build test deploy clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment
	docker-compose up -d postgres redis
	npm run dev

build: ## Build all services
	npm run build

test: ## Run all tests
	npm run test

deploy: ## Deploy to production
	./scripts/deploy.sh

k8s-deploy: ## Deploy to Kubernetes
	kubectl apply -f k8s/

backup: ## Run backup
	./scripts/backup.sh

clean: ## Clean all dependencies and builds
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf services/*/node_modules
	rm -rf apps/*/.next
	rm -rf services/*/dist

install: ## Install all dependencies
	npm install

docker-build: ## Build Docker images
	docker build -t aurum-911/api:latest ./services/hrplus-api
	docker build -t aurum-911/web:latest ./apps/web

docker-up: ## Start Docker Compose
	docker-compose up -d

docker-down: ## Stop Docker Compose
	docker-compose down

logs: ## Show logs
	docker-compose logs -f

status: ## Show system status
	kubectl get pods -n aurum-911