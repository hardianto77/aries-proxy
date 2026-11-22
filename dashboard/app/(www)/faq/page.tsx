import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Aries Proxy: authentication, rotation, ports, MCP and self-hosting.",
};

const faqs = [
  ["Why do I get 407 on every request?", "The credentials are missing, wrong, or the password contains characters that must be URL-encoded in the proxy URL (for example @ as %40). Confirm with a single curl call using -x and the exact user:pass pair."],
  ["What is the difference between port 25600 and 8000?", "Both accept standard proxy authentication. Port 25600 fronts the rotating residential pool; port 8000 is the proxy listener used by the management plane and API-oriented traffic. Exit IPs differ by design — that is rotation working."],
  ["How does rotation behave?", "Rotation follows the configured method (random or time-based). Health checks continuously verify exits and quarantine unhealthy ones; fallback retries route a failed request through another healthy exit."],
  ["Can I filter exits by country or ISP?", "Yes. Pools support country, ASN and ISP filters plus tag-based composition, configured per pool in the dashboard or via the management API."],
  ["Does it work with AI tools?", "Yes — the platform ships an MCP server at /api/v1/mcp exposing status, working-proxy listing and client-URL tools, plus a conventional REST API for everything else."],
  ["Where does my traffic go?", "Nowhere but your own deployment. Aries Proxy is self-hosted: exits are stored in your database and traffic flows through your server. No third-party relay is involved."],
  ["Is there a hosted version?", "No. There is no SaaS tier — you run the software, you own the data. The pricing page breaks down what is included at zero license cost."],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">FAQ</h1>
      <div className="mt-8 divide-y divide-border rounded-lg border border-border">
        {faqs.map(([q, a]) => (
          <details key={q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium marker:hidden">
              {q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        More detail in the{" "}
        <Link href="/developers" className="font-medium text-foreground underline underline-offset-4">
          docs
        </Link>
        .
      </p>
    </div>
  );
}
