import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-semibold tracking-tight">Aries Proxy</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Self-hosted rotating residential proxy platform with user:pass authentication, health checks and a management API.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Product</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link href="/developers" className="hover:text-foreground">Docs</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium">Access</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li><Link href="/login" className="hover:text-foreground">Dashboard login</Link></li>
            <li><a href="/api/v1/swagger.json" className="hover:text-foreground">OpenAPI spec</a></li>
            <li><a href="https://github.com/hardianto77/aries-proxy" className="hover:text-foreground">Source (GitHub)</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aries Proxy. All rights reserved.
      </div>
    </footer>
  );
}
