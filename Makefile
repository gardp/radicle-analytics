.PHONY: migration-new migrate-local current-local heads history migrate-prod current-prod

COMPOSE ?= docker-compose
BACKEND_SERVICE ?= backend
MSG ?= schema_update
# COMPOSE ?= docker compose --env-file ./backend/.env.prod

migration-new:
	$(COMPOSE) exec $(BACKEND_SERVICE) alembic revision --autogenerate -m "$(MSG)"

migrate-local:
	$(COMPOSE) exec $(BACKEND_SERVICE) alembic upgrade head

current-local:
	$(COMPOSE) exec $(BACKEND_SERVICE) alembic current

heads:
	$(COMPOSE) exec $(BACKEND_SERVICE) alembic heads

history:
	$(COMPOSE) exec $(BACKEND_SERVICE) alembic history --verbose

migrate-prod:
	$(COMPOSE) exec $(BACKEND_SERVICE) bash -lc 'DATABASE_URL="$$SUPABASE_PROD_DB_URL" alembic upgrade head'

current-prod:
	$(COMPOSE) exec $(BACKEND_SERVICE) bash -lc 'DATABASE_URL="$$SUPABASE_PROD_DB_URL" alembic current'
