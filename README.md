# Aries Proxy

<p align="center">
  <b>Aries Proxy</b> — self-hosted proxy rotation platform with a Go core and a Next.js dashboard.
</p>

Aries Proxy is a rotating proxy gateway: clients connect with a standard
`user:pass@host:port` proxy URL, and every request is routed through a curated
pool of upstream proxies with automatic health checks, retries and per-user
rate limits. The stack ships with an OpenAPI-style management REST API and a
full web dashboard (pools, users, geo filters, live logs, metrics).

## Features

- **Standard client authentication** — `http://user:pass@host:25600` via
  `Proxy-Authorization: Basic` (RFC 7235). Works with curl, Python `requests`,
  Node/axios, Go, Scrapy, Selenium/Playwright, Proxifier, browsers and any
  HTTP client that supports proxies.
- **HTTP CONNECT tunneling** — full HTTPS support through CONNECT.
- **Rotating pools** — round-robin rotation with per-user pool assignment,
  fallback pools, geo/ISP/tag filters and `max_retries` per request.
- **Health checks** — periodic and on-demand pool testing; dead proxies are
  disabled automatically.
- **Per-user rate limiting** — `requests_per_minute` per proxy user.
- **MCP server built-in** — stateless Model Context Protocol endpoint (`POST /api/v1/mcp`, JSON-RPC 2.0) so AI clients (Claude, Cursor, agents) can query status, list active exits and build client URLs directly.
- **Management REST API** — Bearer-token authenticated endpoints for users,
  pools, proxies, exports, logs and metrics (Swagger UI at `/docs`).
- **Web dashboard** — Next.js 16 + Tailwind, responsive on desktop and mobile.
- **Alerting** — pool-level alerts with a built-in watcher service.

## Architecture

```
Client ──HTTP/CONNECT──▶ Aries Proxy core (Go) ──▶ upstream proxy pool ──▶ target
                 ▲
Management API / WebSocket  ◀──  Dashboard (Next.js)  ◀── admin browser
```

| Component        | Tech                          | Port        |
|------------------|-------------------------------|-------------|
| Proxy core       | Go (net/http)                 | `8000` / `25600` |
| Management API   | Go (same binary, `/api/v1`)   | internal via reverse proxy |
| Dashboard        | Next.js 16, React, Tailwind   | `3000` (internal) |
| Database         | TimescaleDB / PostgreSQL      | `5432` (internal) |
| Entry point      | Caddy reverse proxy           | `80/443`    |

## Quick start

```bash
git clone https://github.com/hardianto77/aries-proxy.git
cd aries-proxy
cp .env.example .env         # set admin credentials & secrets
docker compose up -d --build
```

Then open the dashboard (default `http://localhost`, set `SITE_ADDRESS` for
a domain with automatic HTTPS) and create a proxy user.

### Client usage

```bash
curl -x http://USERNAME:PASSWORD@proxy.example.com:25600 https://httpbin.org/ip
```

- URL-encode special characters in the password (`@` → `%40`, `!` → `%21`).
- Failed auth returns `407` with `Proxy-Authenticate: Basic realm="Aries Proxy"`.
- Two proxy ports are exposed by default: `25600` (primary) and `8000`.

Full client integration guide (all languages + API reference + error table):
[`docs/ARIES_PROXY_CLIENT_GUIDE.md`](docs/ARIES_PROXY_CLIENT_GUIDE.md)

## Management API (overview)

```
POST   /api/v1/auth/login              → Bearer token
GET    /api/v1/proxy-users             → list proxy users
POST   /api/v1/proxy-users             → create user
PUT    /api/v1/proxy-users/{id}        → update pools/limits
GET    /api/v1/pools                   → list pools
POST   /api/v1/pools/{id}/test         → run health check
GET    /api/v1/pools/{id}/export       → export pool (txt/csv)
GET    /api/v1/users/working-proxies   → currently working exits
GET    /api/v1/logs                    → paginated system logs
GET    /health                         → service health
```

Interactive docs: `/docs` (Swagger UI).

## Security notes

- Change the default admin credentials before exposing the dashboard.
- All management traffic should go through HTTPS (Caddy auto-TLS with a domain).
- Proxy user passwords are stored as hashes; plaintext is never persisted.
- Login endpoint is rate-limited (per-IP and global lockout).

## License

Apache-2.0 (see [LICENSE](LICENSE)).
