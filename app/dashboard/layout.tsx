import { redirect } from "next/navigation"
import Link from "next/link"
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
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { requireRole } from "@/lib/authHelper"
import type { Role } from "@/lib/collections"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardUserCard } from "@/components/dashboard/dashboard-user-card"

export const metadata = {
  title: "Dashboard",
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/tuitions", label: "Browse Tuitions", icon: Search },
    { href: "/dashboard/bookmarks", label: "Saved Tuitions", icon: Bookmark },
    { href: "/dashboard/applications", label: "My Applications", icon: ClipboardList },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
  tutor: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tuitions", label: "My Tuitions", icon: GraduationCap },
    { href: "/dashboard/tuitions/new", label: "Post a Tuition", icon: Plus },
    { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
  admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/tuitions", label: "Moderation", icon: ShieldCheck },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side session + role enforcement. Anonymous users are redirected
  // to sign-in by requireSession(); the role is validated below.
  const session = await requireRole(["student", "tutor", "admin"])
  const role = session.user.role
  const nav = NAV_BY_ROLE[role]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="sticky top-20 space-y-6">
            <DashboardUserCard
              name={session.user.name}
              email={session.user.email}
              role={role}
              image={session.user.image}
            />
            <DashboardNav items={nav} />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}