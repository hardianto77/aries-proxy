import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Aries Proxy quickstart: client authentication formats, protocol matrix, quick start for curl, Python, Node and Go, management API and MCP endpoint reference.",
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed sm:text-sm">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Docs</h1>
      <p className="mt-3 text-muted-foreground">
        Everything needed to consume Aries Proxy from a client, script or agent.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">1. Proxy URL format</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The data plane speaks standard HTTP proxy authentication. Point any client at:
      </p>
      <div className="mt-3">
        <Code>{"http://username:password@your-domain:25600   # rotating pool\nhttp://username:password@your-domain:8000    # API listener"}</Code>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Authentication uses RFC 7235 <code className="font-mono">Proxy-Authorization</code>.
        URL-encode special characters in the password (for example <code className="font-mono">@</code> becomes{" "}
        <code className="font-mono">%40</code>). A 407 response means credentials were missing or wrong.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">2. Quick start</h2>
      <div className="mt-3 space-y-4">
        <div>
          <p className="text-sm font-medium">curl</p>
          <Code>{"curl -x http://user:pass@your-domain:25600 https://ipinfo.io"}</Code>
        </div>
        <div>
          <p className="text-sm font-medium">Python (requests)</p>
          <Code>{"import requests\n\nproxy = \"http://user:pass@your-domain:25600\"\nr = requests.get(\"https://ipinfo.io\", proxies={\"http\": proxy, \"https\": proxy}, timeout=30)\nprint(r.json())"}</Code>
        </div>
        <div>
          <p className="text-sm font-medium">Node (undici / global fetch)</p>
          <Code>{"import { ProxyAgent, fetch } from \"undici\";\n\nconst agent = new ProxyAgent(\"http://user:pass@your-domain:25600\");\nconst res = await fetch(\"https://ipinfo.io\", { dispatcher: agent });\nconsole.log(await res.json());"}</Code>
        </div>
        <div>
          <p className="text-sm font-medium">Go</p>
          <Code>{"u, _ := url.Parse(\"http://user:pass@your-domain:25600\")\nclient := &http.Client{\n\tTransport: &http.Transport{Proxy: http.ProxyURL(u)},\n\tTimeout:   30 * time.Second,\n}"}</Code>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">3. Protocol matrix</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Scheme</th>
              <th className="px-4 py-2 font-medium">Tunneling</th>
              <th className="px-4 py-2 font-medium">Auth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono">http://</td><td className="px-4 py-2">CONNECT for HTTPS targets</td><td className="px-4 py-2">user:pass in URL or header</td></tr>
            <tr><td className="px-4 py-2 font-mono">https://</td><td className="px-4 py-2">TLS to proxy, then CONNECT</td><td className="px-4 py-2">user:pass in URL or header</td></tr>
            <tr><td className="px-4 py-2 font-mono">socks5://</td><td className="px-4 py-2">Native SOCKS5 handshake</td><td className="px-4 py-2">user:pass (RFC 1929)</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">4. Management REST API</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Log in to mint a Bearer token, then operate the platform. Full machine-readable
        spec is served at{" "}
        <a href="/api/v1/swagger.json" className="underline underline-offset-4">/api/v1/swagger.json</a>.
      </p>
      <div className="mt-3">
        <Code>{"# login\ncurl -X POST https://your-domain/api/v1/auth/login \\\\\n  -H \"Content-Type: application/json\" \\\\\n  -d '{\"username\":\"admin\",\"password\":\"YOUR_PASSWORD\"}'\n\n# list users (with token)\ncurl https://your-domain/api/v1/users -H \"Authorization: Bearer $TOKEN\""}</Code>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">5. MCP endpoint</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        AI clients (Claude Desktop, Cursor, custom agents) can operate Aries Proxy through
        the built-in MCP server — JSON-RPC 2.0 over the management API.
      </p>
      <div className="mt-3">
        <Code>{"{\"mcpServers\":{\"aries-proxy\":{\"type\":\"url\",\n  \"url\":\"https://your-domain/api/v1/mcp\",\n  \"headers\":{\"Authorization\":\"Bearer <token>\"}}}}"}</Code>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Tools: <code className="font-mono">aries_proxy_status</code>,{" "}
        <code className="font-mono">aries_proxy_list_working_proxies</code>,{" "}
        <code className="font-mono">aries_proxy_client_url</code>.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">6. Errors</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[26rem] text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr><th className="px-4 py-2 font-medium">Code</th><th className="px-4 py-2 font-medium">Meaning</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2 font-mono">407</td><td className="px-4 py-2">Proxy authentication failed — check user:pass and URL-encoding</td></tr>
            <tr><td className="px-4 py-2 font-mono">502</td><td className="px-4 py-2">No healthy upstream available for the target</td></tr>
            <tr><td className="px-4 py-2 font-mono">429</td><td className="px-4 py-2">Rate limit exceeded for the user</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
