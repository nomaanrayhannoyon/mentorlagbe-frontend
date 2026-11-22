import Link from "next/link"
import {
  ClipboardList,
  GraduationCap,
  Bookmark,
  Users,
  ShieldCheck,
  Plus,
  Search,
  TrendingUp,
  CreditCard,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { requireRole } from "@/lib/authHelper"
import { getCollection, Collections } from "@/lib/collections"
import { toObjectId } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = { title: "Dashboard" }

type StatCard = {
  label: string
  value: number | string
  icon: LucideIcon
  href?: string
}

function StatCardView({ label, value, icon: Icon, href }: StatCard) {
  const inner = (
    <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-burgundy-500/10 text-burgundy-600 dark:bg-burgundy-500/15 dark:text-burgundy-400">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function DashboardPage() {
  const session = await requireRole(["student", "tutor", "admin"])
  const role = session.user.role
  const userId = session.user.id

  let stats: StatCard[] = []
  const greeting = "Welcome back"

  if (role === "student") {
    const apps = await getCollection(Collections.applications)
    const users = await getCollection(Collections.users)
    const [appCount, me] = await Promise.all([
      apps.countDocuments({ studentId: userId }),
      users.findOne(
        { _id: toObjectId(userId)! },
        { projection: { savedTuitions: 1 } }
      ),
    ])
    const bmCount = me?.savedTuitions?.length ?? 0
    stats = [
      {
        label: "My applications",
        value: appCount,
        icon: ClipboardList,
        href: "/dashboard/applications",
      },
      {
        label: "Saved tuitions",
        value: bmCount,
        icon: Bookmark,
        href: "/dashboard/bookmarks",
      },
    ]
  } else if (role === "tutor") {
    const tuitions = await getCollection(Collections.tuitions)
    const apps = await getCollection(Collections.applications)
    const [tutorTuitionCount, pendingCount, appCount] = await Promise.all([
      tuitions.countDocuments({ tutorId: userId }),
      tuitions.countDocuments({ tutorId: userId, status: "pending" }),
      apps.countDocuments({
        tuitionId: {
          $in: (
            await tuitions
              .find({ tutorId: userId })
              .project({ _id: 1 })
              .toArray()
          ).map((t) => t._id.toString()),
        },
      }),
    ])
    stats = [
      {
        label: "My tuitions",
        value: tutorTuitionCount,
        icon: GraduationCap,
        href: "/dashboard/tuitions",
      },
      { label: "Awaiting approval", value: pendingCount, icon: ShieldCheck },
      {
        label: "Applications",
        value: appCount,
        icon: ClipboardList,
        href: "/dashboard/applications",
      },
    ]
  } else {
    const tuitions = await getCollection(Collections.tuitions)
    const users = await getCollection(Collections.users)
    const apps = await getCollection(Collections.applications)
    const payments = await getCollection(Collections.payments)
    const [pendingTuitions, totalUsers, totalApps, paidPayments] =
      await Promise.all([
        tuitions.countDocuments({ status: "pending" }),
        users.countDocuments({}),
        apps.countDocuments({}),
        payments.find({ status: "paid" }).project({ amount: 1 }).toArray(),
      ])
    const totalRevenue = paidPayments.reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0
    )
    stats = [
      {
        label: "Pending review",
        value: pendingTuitions,
        icon: ShieldCheck,
        href: "/dashboard/admin/tuitions",
      },
      {
        label: "Total users",
        value: totalUsers,
        icon: Users,
        href: "/dashboard/admin/users",
      },
      {
        label: "Total applications",
        value: totalApps,
        icon: ClipboardList,
        href: "/dashboard/admin/applications",
      },
      {
        label: "Revenue collected",
        value: `$${totalRevenue.toFixed(2)}`,
        icon: CreditCard,
        href: "/dashboard/payments",
      },
    ]
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {greeting}, {session.user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here is what is happening with your account today.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCardView key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="size-5 text-burgundy-600" />
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {role === "student" && (
            <>
              <Link href="/tuitions" className={buttonVariants({})}>
                <Search /> Browse tuitions
              </Link>
              <Link
                href="/dashboard/bookmarks"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Bookmark /> Saved
              </Link>
            </>
          )}
          {role === "tutor" && (
            <>
              <Link
                href="/dashboard/tuitions/new"
                className={buttonVariants({})}
              >
                <Plus /> Post a tuition
              </Link>
              <Link
                href="/dashboard/tuitions"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <GraduationCap /> My tuitions
              </Link>
            </>
          )}
          {role === "admin" && (
            <Link
              href="/dashboard/admin/tuitions"
              className={buttonVariants({})}
            >
              <ShieldCheck /> Review pending tuitions
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
