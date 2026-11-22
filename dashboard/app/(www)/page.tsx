import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Rotating residential exits",
    body: "Thousands of verified residential and datacenter exits rotate automatically on every request, with health checks removing dead nodes before they cost you a request.",
  },
  {
    title: "Plain user:pass authentication",
    body: "One HTTP endpoint, standard Proxy-Authorization. Works with curl, Python, Node, Go, Scrapy, Playwright and every HTTP client you already have.",
  },
  {
    title: "Management API & MCP",
    body: "Operate the platform over a documented REST API or the built-in MCP server — query status, list working exits and build client URLs from your AI tools.",
  },
  {
    title: "Health checks that mean it",
    body: "Configurable workers, timeouts and success-rate thresholds. Unhealthy exits are quarantined automatically; fallback retries keep requests alive.",
  },
  {
    title: "Geo & ISP filtering",
    body: "Target pools by country, ASN or ISP. Tag-based filters let you compose exact exit profiles per project instead of one-size-fits-all lists.",
  },
  {
    title: "Self-hosted, your rules",
    body: "Runs on your own infrastructure: Docker Compose, TimescaleDB behind the scenes, Caddy in front. No third-party sees your traffic or credentials.",
  },
];

const stats = [
  { value: "10,000+", label: "exits verified continuously" },
  { value: "<3s", label: "median response time" },
  { value: "100%", label: "success rate on healthy pools" },
  { value: "3", label: "access paths: proxy URL, REST, MCP" },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Self-hosted proxy rotation
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Rotating residential proxies you actually own.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Aries Proxy rotates verified residential exits behind a single endpoint with
            standard user:pass authentication — plus a full management API and MCP server.
            Self-hosted, auditable, yours.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/developers"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Read the quickstart
            </Link>
            <Link
              href="/features"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              Explore features
            </Link>
          </div>
          <div className="mt-10 max-w-2xl overflow-x-auto rounded-lg border border-border bg-muted/40 p-4">
            <code className="whitespace-nowrap font-mono text-xs sm:text-sm">
              curl -x http://user:pass@your-domain:25600 https://ipinfo.io
            </code>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built for real traffic</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-border p-5">
              <h3 className="font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Ready to route?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deploy with Docker Compose and your first pool is minutes away.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
