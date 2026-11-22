import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Rotation strategies, health checks, geo filtering, rate limiting and management APIs — the full Aries Proxy feature set.",
};

const groups = [
  {
    heading: "Proxy data plane",
    items: [
      ["Rotating exits", "Random and time-based rotation with configurable intervals. Unhealthy exits are pulled from rotation automatically."],
      ["Dual ports", "Port 25600 for the rotating pool and port 8000 for the proxy API listener — both speak standard HTTP CONNECT."],
      ["Protocol support", "HTTP, HTTPS via CONNECT, and SOCKS5/4/4a upstreams, filtered by the allowed_protocols setting."],
      ["Fallback & retries", "Configurable fallback with max retries, follow-redirect control and per-request timeouts."],
    ],
  },
  {
    heading: "Pool intelligence",
    items: [
      ["Health checks", "Worker pools, timeouts, status and header assertions against a check URL of your choice."],
      ["Geo & ISP filters", "Country, ASN and ISP targeting per pool, plus tag-based composition for precise exit profiles."],
      ["Source aggregation", "Ingest exits from multiple sources with alert rules when a source degrades."],
      ["Auto cleanup", "Proxy cleanup routines evict stale, low-success-rate exits on schedule."],
    ],
  },
  {
    heading: "Control plane",
    items: [
      ["Management REST API", "Documented endpoints for users, pools, sources, logs, exports and settings — Bearer-authenticated."],
      ["MCP server", "A stateless JSON-RPC 2.0 MCP endpoint so AI clients can call status, list-working-proxies and client-url tools directly."],
      ["Dashboard", "Responsive web UI for pools, users, settings and live logs — desktop and mobile layouts."],
      ["Rate limiting", "Per-user request intervals and quotas enforced at the proxy layer."],
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Features</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything Aries Proxy does, split by plane: what handles your traffic, what
        keeps the pool smart, and what keeps you in control.
      </p>
      <div className="mt-10 space-y-12">
        {groups.map((g) => (
          <section key={g.heading}>
            <h2 className="text-xl font-semibold tracking-tight">{g.heading}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.items.map(([t, b]) => (
                <div key={t} className="rounded-lg border border-border p-5">
                  <h3 className="font-medium">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          Want the endpoint-level view? The quickstart covers client setup in five languages.{" "}
          <Link href="/developers" className="font-medium text-foreground underline underline-offset-4">
            Go to docs
          </Link>
        </p>
      </div>
    </div>
  );
}
