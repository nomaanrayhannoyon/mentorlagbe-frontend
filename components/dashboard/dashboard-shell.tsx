"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  Bookmark,
  ClipboardList,
  GraduationCap,
  Users,
  ShieldCheck,
  Plus,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { Plan, Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { DashboardUserCard } from "@/components/dashboard/dashboard-user-card"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = { href: string; label: string; icon: LucideIcon }

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/tuitions", label: "Browse Tuitions", icon: Search },
    { href: "/dashboard/bookmarks", label: "Saved Tuitions", icon: Bookmark },
    {
      href: "/dashboard/applications",
      label: "My Applications",
      icon: ClipboardList,
    },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
  tutor: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tuitions", label: "My Tuitions", icon: GraduationCap },
    { href: "/dashboard/tuitions/new", label: "Post a Tuition", icon: Plus },
    {
      href: "/dashboard/applications",
      label: "Applications",
      icon: ClipboardList,
    },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
  admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/admin/tuitions",
      label: "Moderation",
      icon: ShieldCheck,
    },
    {
      href: "/dashboard/admin/applications",
      label: "Applications",
      icon: ClipboardList,
    },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
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

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={linkClass(active)}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: Role
  user: {
    name: string
    email: string
    image?: string | null
    plan?: Plan
  }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const nav = NAV_BY_ROLE[role]

  const signOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-full flex-col gap-4 p-4">
              <DashboardUserCard
                name={user.name}
                email={user.email}
                role={role}
                plan={user.plan}
                image={user.image}
                href="/profile"
              />
              <NavLinks
                items={nav}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="font-extrabold tracking-tight">
          Mentor<span className="text-burgundy-600">Lagbe</span>
        </Link>

        <UserMenu user={user} onSignOut={signOut} />
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-20 space-y-6">
            <DashboardUserCard
              name={user.name}
              email={user.email}
              role={role}
              plan={user.plan}
              image={user.image}
              href="/profile"
            />
            <div className="rounded-2xl border bg-card p-2 shadow-sm">
              <NavLinks items={nav} pathname={pathname} />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

function UserMenu({
  user,
  onSignOut,
}: {
  user: { name: string; email: string; image?: string | null }
  onSignOut: () => void
}) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open profile menu"
          />
        }
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="size-9 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-burgundy-600 text-sm font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="size-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void onSignOut()}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
