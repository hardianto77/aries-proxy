import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Aries Proxy is free and open source under its license. You pay nothing but your own infrastructure.",
};

const rows = [
  ["License", "Open source — run it anywhere, no seat limits", "Free"],
  ["Users & pools", "Unlimited proxy users, pools and sources", "Free"],
  ["Requests", "No per-request fees, no bandwidth metering", "Your infra"],
  ["Management API", "Full REST API + MCP server included", "Free"],
  ["Support", "Community support via the GitHub repository", "Free"],
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Aries Proxy is self-hosted software. There is no subscription and no metered
        billing — the only cost is the server you run it on.
      </p>

      <div className="mt-8 rounded-lg border border-border">
        {rows.map(([k, v, price], i) => (
          <div
            key={k}
            className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <div>
              <p className="font-medium">{k}</p>
              <p className="text-sm text-muted-foreground">{v}</p>
            </div>
            <p className="text-sm font-semibold sm:text-right">{price}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-5">
          <h2 className="font-semibold tracking-tight">Fresh install</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Clone the repository and bring the stack up with Docker Compose. Configuration
            is environment-variable driven and documented in the README.
          </p>
          <a
            href="https://github.com/hardianto77/aries-proxy"
            className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
          >
            github.com/hardianto77/aries-proxy
          </a>
        </div>
        <div className="rounded-lg border border-border p-5">
          <h2 className="font-semibold tracking-tight">This deployment</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The instance behind this site is the production deployment. Request proxy
            access from the administrator, then connect with your user:pass credentials.
          </p>
          <Link href="/login" className="mt-3 inline-flex text-sm font-medium underline underline-offset-4">
            Dashboard login
          </Link>
        </div>
      </div>
    </div>
  );
}
