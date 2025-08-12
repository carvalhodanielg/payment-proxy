.PHONY: help build up down logs clean test health

# Variáveis
COMPOSE_FILE = docker-compose.yml
SERVICE_NAME = app

# Comando padrão
help:
	@echo "Comandos disponíveis:"
	@echo "  build     - Construir as imagens Docker"
	@echo "  up        - Subir todos os serviços"
	@echo "  down      - Parar e remover todos os serviços"
	@echo "  logs      - Ver logs da aplicação"
	@echo "  clean     - Limpar containers, volumes e imagens"
	@echo "  test      - Testar a aplicação"
	@echo "  health    - Verificar saúde dos serviços"

# Construir imagens
build:
	docker-compose -f $(COMPOSE_FILE) build

# Subir serviços
up:
	docker-compose -f $(COMPOSE_FILE) up -d

# Parar serviços
down:
	docker-compose -f $(COMPOSE_FILE) down

# Ver logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE_NAME)

# Limpar tudo
clean:
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	docker system prune -f

# Testar aplicação
test:
	@echo "Testando endpoints da aplicação..."
	@echo "Health check:"
	@curl -s http://localhost:3000/payments/service-health | jq . || echo "Falha no health check"
	@echo "Testando processamento de pagamento:"
	@curl -s -X POST http://localhost:3000/payments \
		-H "Content-Type: application/json" \
		-d '{"correlationId":"test-123","amount":19.90,"requestedAt":"2025-01-15T12:34:56.000Z"}' | jq . || echo "Falha no processamento"

# Verificar saúde dos serviços
health:
	@echo "Verificando saúde dos serviços..."
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "Health checks:"
	@docker-compose -f $(COMPOSE_FILE) exec -T app bun run health-check || echo "App health check falhou"
	@docker-compose -f $(COMPOSE_FILE) exec -T redis redis-cli ping || echo "Redis health check falhou"

# Desenvolvimento local
dev:
	docker-compose -f $(COMPOSE_FILE) up -d redis
	@echo "Redis rodando. Execute 'bun run dev:watch' para desenvolvimento local"

# Produção
prod:
	docker-compose -f $(COMPOSE_FILE) -f docker-compose.prod.yml up -d

# Escalar aplicação
scale:
	docker-compose -f $(COMPOSE_FILE) up -d --scale app=3
