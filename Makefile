.PHONY: api-install api-dev api-test api-lint api-format web-install web-dev web-test lint test dev

api-install:
	cd apps/api && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

api-dev:
	cd apps/api && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

api-test:
	cd apps/api && . .venv/bin/activate && pytest -q

api-lint:
	cd apps/api && . .venv/bin/activate && ruff check . --config pyproject.toml

api-format:
	cd apps/api && . .venv/bin/activate && ruff check --fix . --config pyproject.toml

web-install:
	cd apps/web && pnpm install

web-dev:
	cd apps/web && pnpm dev

web-test:
	cd apps/web && pnpm test

# Canonical lint entry — matches what CI runs.
lint: api-lint

test: api-test web-test

dev:
	@echo "Run in two terminals: make api-dev  |  make web-dev"
