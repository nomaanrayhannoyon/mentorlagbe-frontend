"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const linkClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950 dark:text-burgundy-400"
      : "text-foreground/70 hover:bg-muted hover:text-foreground"
  )

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 rounded-2xl border bg-card p-2 shadow-sm">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link key={href} href={href} className={linkClass(active)}>
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}