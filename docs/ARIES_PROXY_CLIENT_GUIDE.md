# Aries Proxy — Client Integration Guide (Official)

**Service:** Aries Proxy (proxy rotation platform)
**Dashboard:** https://proxy.aries.ai.id
**Proxy Endpoints:**
- Primary: `resi.aries.ai.id:25600`
- Secondary: `resi.aries.ai.id:8000`

---

## 1. Supported Authentication Formats

Aries Proxy accepts standard HTTP/HTTPS/SOCKS5 proxy URL formats with Basic
proxy authentication (RFC 7235 `Proxy-Authorization` header).

### 1.1 Full URL format (recommended)

```
http://USERNAME:PASSWORD@resi.aries.ai.id:25600
```

Example:

```
http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600
```

- `USERNAME` — your Aries Proxy username (created in Dashboard → Users)
- `PASSWORD` — the user's password
- Special characters in the password MUST be URL-encoded
  (e.g. `@` → `%40`, `!` → `%21`, `#` → `%23`)

### 1.2 Split host / port / credentials format

| Field    | Value                |
|----------|----------------------|
| Host     | `resi.aries.ai.id`   |
| Port     | `25600` (or `8000`)  |
| Username | your username        |
| Password | your password        |

Tools that separate fields (curl `-x`, Proxifier, browser extensions,
Scrapy, Selenium, Puppeteer, Playwright) work with:

```
host:     resi.aries.ai.id
port:     25600
user:     trial
pass:     ********
protocol: http (CONNECT tunnel supported for HTTPS)
```

### 1.3 Authentication header (raw HTTP)

The proxy uses the standard `Proxy-Authorization: Basic <base64(user:pass)>`
header. Any client that sends this header is compatible.

On failed authentication the server responds:

```
HTTP/1.1 407 Proxy Authentication Required
Proxy-Authenticate: Basic realm="Aries Proxy"
```

---

## 2. Protocol Support

| Feature                  | Supported |
|--------------------------|-----------|
| HTTP CONNECT tunneling   | ✅ |
| HTTPS through CONNECT    | ✅ |
| Plain HTTP proxying      | ✅ |
| SOCKS5 (client-side)     | ✅ (auto-handled by CONNECT bridge) |
| Keep-Alive               | ✅ |
| IPv6 targets             | ✅ (depends on exit node) |

---

## 3. Quick Start Examples

### 3.1 curl

```bash
curl -x http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600 https://httpbin.org/ip
```

### 3.2 Python (requests)

```python
proxies = {
    "http":  "http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600",
    "https": "http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600",
}
import requests
print(requests.get("https://httpbin.org/ip", proxies=proxies, timeout=30).json())
```

### 3.3 Node.js (axios + https-proxy-agent)

```javascript
const { HttpsProxyAgent } = require("https-proxy-agent");
const agent = new HttpsProxyAgent("http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600");
axios.get("https://httpbin.org/ip", { httpsAgent: agent });
```

### 3.4 Go

```go
proxyURL, _ := url.Parse("http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600")
client := &http.Client{ Transport: &http.Transport{ Proxy: http.ProxyURL(proxyURL) } }
```

### 3.5 Environment variables (POSIX)

```bash
export HTTP_PROXY="http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600"
export HTTPS_PROXY="http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600"
```

---

## 4. Rotation Behavior

- Each request may exit from a different IP (rotating residential pool).
- Retries: up to `max_retries` (default 5) per request on dead exits.
- Rate limit: `requests_per_minute` per user (0 = unlimited).

---

## 5. OpenAPI (Reverse-Engineering-Friendly) Management API

The management REST API is OpenAPI-documented and lives under:

```
https://proxy.aries.ai.id/api/v1/...
```

Authentication: `Authorization: Bearer <token>` obtained from
`POST /api/v1/auth/login` (dashboard admin credentials).

Key endpoints (all JSON):

| Method | Path                              | Purpose                          |
|--------|-----------------------------------|----------------------------------|
| POST   | `/api/v1/auth/login`              | Obtain bearer token              |
| GET    | `/api/v1/proxy-users`             | List proxy users                 |
| POST   | `/api/v1/proxy-users`             | Create proxy user                |
| PUT    | `/api/v1/proxy-users/{id}`        | Update user (pools, limits)      |
| DELETE | `/api/v1/proxy-users/{id}`        | Delete user                      |
| GET    | `/api/v1/users/working-proxies`   | Export currently-working exits   |
| GET    | `/api/v1/pools`                   | List pools                       |
| POST   | `/api/v1/pools`                   | Create pool                      |
| GET    | `/api/v1/pools/{id}/export`       | Export pool (`format=txt|csv`)   |
| POST   | `/api/v1/pools/{id}/test`         | Trigger health check             |
| GET    | `/api/v1/proxies`                 | List upstream proxies            |
| GET    | `/api/v1/logs`                    | System logs (paginated)          |
| GET    | `/health`                         | Service health probe             |

Example — create a user and use it immediately:

```bash
TOKEN=$(curl -s -X POST https://proxy.aries.ai.id/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"********"}' | jq -r .token)

curl -s -X POST https://proxy.aries.ai.id/api/v1/proxy-users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"username":"client1","password":"StrongPass1!","enabled":true,"main_pool_id":1,"max_retries":5}'

# Client usage right away:
curl -x http://client1:StrongPass1%21@resi.aries.ai.id:25600 https://httpbin.org/ip
```

Interactive docs: `https://proxy.aries.ai.id/docs` (Swagger UI).

---

## 6. Error Reference

| Response                         | Meaning                                   | Fix                            |
|----------------------------------|-------------------------------------------|--------------------------------|
| `407` + `realm="Aries Proxy"`    | Missing/invalid credentials               | Check user:pass & URL-encoding |
| `502` on CONNECT                 | No healthy exit available                 | Retry; check pool health       |
| `429`                            | User rate limit exceeded                  | Raise `requests_per_minute`    |
| Connection refused               | Wrong port / service down                 | Use 25600 or 8000; check status page |

---

© Aries Proxy. All client-facing formats above are the official specification.

---

## 7. MCP (Model Context Protocol) Endpoint

Aries Proxy ships a built-in **MCP server** so AI clients (Claude Desktop,
Cursor, IDE agents, custom agents) can operate the proxy platform directly.

**Endpoint:** `POST https://proxy.aries.ai.id/api/v1/mcp`
**Protocol:** JSON-RPC 2.0 (MCP `2024-11-05`)
**Auth:** `Authorization: Bearer <token>` — token from `POST /api/v1/auth/login`

### 7.1 Methods

| Method | Description |
|--------|-------------|
| `initialize` | Handshake. Returns server info (`aries-proxy`) and capabilities. |
| `tools/list` | Lists available tools. |
| `tools/call` | Executes a tool with arguments. |
| `ping` | Liveness probe. |

### 7.2 Tools

| Tool | Description |
|------|-------------|
| `aries_proxy_status` | Service stats: active/total proxies, success rate, response time, request counters. |
| `aries_proxy_list_working_proxies` | Active exit proxies (`limit` 1–100, default 20): address, protocol, country, latency. |
| `aries_proxy_client_url` | Builds a ready-to-use `http://user:pass@host:port` URL for any client. |

### 7.3 Example — list tools

```bash
curl -X POST https://proxy.aries.ai.id/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### 7.4 Example — build a client URL

```bash
curl -X POST https://proxy.aries.ai.id/api/v1/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"aries_proxy_client_url","arguments":{"username":"trial","password":"YOUR_PASSWORD"}}}'
```

Response (content[0].text):

```json
{"url":"http://trial:YOUR_PASSWORD@resi.aries.ai.id:25600","host":"resi.aries.ai.id","port":"25600","protocol":"http"}
```

### 7.5 MCP client configuration (Claude Desktop / generic)

```json
{
  "mcpServers": {
    "aries-proxy": {
      "type": "url",
      "url": "https://proxy.aries.ai.id/api/v1/mcp",
      "headers": { "Authorization": "Bearer <your-management-token>" }
    }
  }
}
```

> Note: obtain the token via `POST /api/v1/auth/login` first and refresh it
> when it expires. The proxy data-plane (`user:pass@host:port`) does **not**
> require this token — only the management/MCP plane does.
