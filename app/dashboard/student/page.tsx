import { requireRole } from "@/lib/authHelper"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export const metadata = { title: "Student Dashboard" }

export default async function StudentDashboardPage() {
  // Only students may view this dashboard; other roles are redirected to
  // their own dashboard by requireRole.
  const session = await requireRole("student")
  return <DashboardOverview session={session} />
}
