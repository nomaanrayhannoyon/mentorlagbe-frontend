import { requireRole } from "@/lib/authHelper"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboardPage() {
  // Only admins may view this dashboard.
  const session = await requireRole("admin")
  return <DashboardOverview session={session} />
}
