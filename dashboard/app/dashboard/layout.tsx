"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppNav, MobileNav } from "@/components/shell/app-nav"
import { api } from "@/lib/api"

const STORAGE_KEY = "ariesproxy_sidebar_collapsed"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [username, setUsername] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1")
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  React.useEffect(() => {
    let cancelled = false

    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      setIsLoading(false)
      return
    }

    api
      .getAdminInfo()
      .then((info) => {
        if (cancelled) return
        setUsername(info.username)
      })
      .catch(() => {
        if (cancelled) return
        api.clearToken()
        router.push("/login")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [router])

  if (isLoading) {
    return <p className="text-muted-foreground grid min-h-svh place-items-center">Checking session…</p>
  }

  if (username === null) return null

  return (
    <div className="min-h-svh md:grid md:grid-cols-[13.5rem_1fr] md:transition-[grid-template-columns] md:duration-200 data-[collapsed=true]:md:grid-cols-[3.25rem_1fr]"
      data-collapsed={collapsed}
    >
      <div className="bg-sidebar border-border relative hidden border-r md:block">
        <AppNav username={username} collapsed={collapsed} onToggle={toggle} />
      </div>
      <main className="flex min-w-0 flex-col overflow-x-hidden pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}
