.PHONY: help build up down restart logs shell migrate makemigrations superuser test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker containers
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

shell: ## Open Django shell
	docker-compose exec backend python manage.py shell

bash-backend: ## Open bash in backend container
	docker-compose exec backend bash

bash-frontend: ## Open bash in frontend container
	docker-compose exec frontend sh

migrate: ## Run Django migrations
	docker-compose exec backend python manage.py migrate

makemigrations: ## Create Django migrations
	docker-compose exec backend python manage.py makemigrations

superuser: ## Create Django superuser
	docker-compose exec backend python manage.py createsuperuser

collectstatic: ## Collect static files
	docker-compose exec backend python manage.py collectstatic --noinput

test: ## Run backend tests
	docker-compose exec backend pytest

test-coverage: ## Run tests with coverage report
	docker-compose exec backend pytest --cov=apps --cov-report=html

db-shell: ## Open PostgreSQL shell
	docker-compose exec db psql -U bieszczady -d bieszczady

db-backup: ## Backup database to backup.sql
	docker-compose exec db pg_dump -U bieszczady bieszczady > backup.sql
	@echo "Database backed up to backup.sql"

db-restore: ## Restore database from backup.sql
	cat backup.sql | docker-compose exec -T db psql -U bieszczady -d bieszczady
	@echo "Database restored from backup.sql"

redis-cli: ## Open Redis CLI
	docker-compose exec redis redis-cli

clean: ## Remove all containers, volumes, and images
	docker-compose down -v
	docker system prune -f

clean-all: ## Nuclear option - remove everything
	docker-compose down -v
	docker system prune -a -f
	@echo "Everything cleaned!"

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

install-backend: ## Install new Python package (usage: make install-backend pkg=package-name)
	docker-compose exec backend pip install $(pkg)
	@echo "Don't forget to add $(pkg) to requirements/*.txt"

install-frontend: ## Install new npm package (usage: make install-frontend pkg=package-name)
	docker-compose exec frontend npm install $(pkg)

format-backend: ## Format Python code with black
	docker-compose exec backend black apps/

lint-backend: ## Lint Python code
	docker-compose exec backend flake8 apps/

dev: build up logs ## Full development setup (build, start, show logs)

prod-build: ## Build production containers
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production containers
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production containers
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

status: ## Show status of all containers
	docker-compose ps