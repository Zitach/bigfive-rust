.PHONY: dev-api

dev-api:
	cd backend && cargo watch -x run
