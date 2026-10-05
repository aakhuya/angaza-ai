.PHONY: api-install api-dev api-test web-install web-dev web-test dev

api-install:
	cd apps/api && python3.11 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

api-dev:
	cd apps/api && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

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
