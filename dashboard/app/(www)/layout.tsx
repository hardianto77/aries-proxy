import type { Metadata } from "next";
import { SiteNav } from "./components/site-nav";
import { SiteFooter } from "./components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Aries Proxy — Rotating Residential Proxy Platform",
    template: "%s — Aries Proxy",
  },
  description:
    "Self-hosted rotating residential proxy platform: user:pass authentication, intelligent rotation, health checks, OpenAPI management API and a built-in MCP server.",
};

export default function WwwLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground antialiased">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
