"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  FileText,
  Gauge,
  Layers,
  Network,
  Rss,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/shell/account-menu";

export const NAV: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}[] = [
  { href: "/dashboard", label: "Overview", icon: Gauge, exact: true },
  { href: "/dashboard/proxies", label: "Proxies", icon: Network },
  { href: "/dashboard/sources", label: "Sources", icon: Rss },
  { href: "/dashboard/pools", label: "Pools", icon: Layers },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/logs", label: "Logs", icon: FileText },
  { href: "/dashboard/metrics", label: "System", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppNav({
  username,
  collapsed,
  onToggle,
}: {
  username: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const tz = React.useMemo(() => {
    try {
      const name = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = -new Date().getTimezoneOffset() / 60;
      const sign = offset >= 0 ? "+" : "−";
      return `${name.split("/").pop()?.replace("_", " ") ?? name} (GMT${sign}${Math.abs(offset)})`;
    } catch {
      return "local time";
    }
  }, []);

  return (
    <aside className="border-border bg-sidebar hidden h-svh flex-col border-r px-2 py-3 md:flex md:px-3 md:py-4">
      <div className="flex items-center gap-1">
        <Link
          href="/dashboard"
          aria-label="Aries Proxy dashboard"
          className={cn(
            "flex min-w-0 flex-1 items-center rounded-md px-1 py-1 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            collapsed ? "justify-center" : "justify-start gap-2 md:px-2",
          )}
        >
          <img
            src="/logo.png"
            alt=""
            aria-hidden
            className={cn(
              "shrink-0 rounded-md object-contain transition-all duration-200",
              collapsed ? "size-7" : "size-8",
            )}
          />
          {!collapsed && (
            <>
              <span className="truncate font-semibold tracking-tight">Aries Proxy</span>
              <span className="label border-border ml-auto rounded border px-1.5 leading-4">
                Admin
              </span>
            </>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground focus-visible:ring-ring flex size-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform duration-200",
              collapsed && "rotate-180",
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </div>

      <nav
        aria-label="Primary"
        className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
      >
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex items-center rounded-md px-2 py-1.5 font-medium whitespace-nowrap transition-colors",
                collapsed ? "justify-center" : "gap-2",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon
                className="size-3.5 shrink-0"
                strokeWidth={1.75}
                aria-hidden
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-3 flex flex-col gap-2",
          collapsed ? "items-center" : "items-stretch",
        )}
      >
        {!collapsed && <p className="label truncate px-2">{tz}</p>}
        <AccountMenu username={username} compact={collapsed} />
      </div>
    </aside>
  );
}

// Mobile: fixed bottom navigation bar with the same items & active states.
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="bg-sidebar border-border fixed inset-x-0 bottom-0 z-40 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active
                ? "text-sidebar-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon
              className={cn("size-5 shrink-0", active && "text-primary")}
              strokeWidth={active ? 2.25 : 1.75}
              aria-hidden
            />
            <span className="w-full truncate text-center text-[10px] leading-tight font-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
