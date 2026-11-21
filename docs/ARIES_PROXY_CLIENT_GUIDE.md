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
