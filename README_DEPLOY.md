# Deploy (durev.ru)

## Prereqs

- Docker, Docker Compose installed
- DNS A record: `durev.ru` -> VM IP (or subdomain)

## Env

Create `.env` near `docker-compose.yml`:

```
DOMAIN=durev.ru
ACME_EMAIL=you@example.com
JWT_SECRET=change-me
BOT_TOKEN=123456:abcdef...
BOT_USERNAME=my_calls_bot
ROOM_SECRET=super-secret
```

## Build & Run

```
docker compose build
docker compose up -d
```

Frontend: https://durev.ru
API: https://durev.ru/api

## Notes

- Caddy issues certificates automatically for `$DOMAIN`.
- Bot button uses `WEBAPP_URL=https://$DOMAIN`.
- Update `BOT_USERNAME` without `@`.
