.PHONY: api-install api-dev api-test api-lint web-install web-dev web-test dev

api-install:
	cd apps/api && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

api-dev:
	cd apps/api && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

api-lint:
	cd apps/api && . .venv/bin/activate && ruff check --no-cache .

api-test:
	cd apps/api && . .venv/bin/activate && pytest -q

web-install:
	cd apps/web && pnpm install

web-dev:
	cd apps/web && pnpm dev

web-test:
	cd apps/web && pnpm test

dev:
	@echo "Run in two terminals: make api-dev  |  make web-dev"
