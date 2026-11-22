import { requireRole } from "@/lib/authHelper"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export const metadata = { title: "Tutor Dashboard" }

export default async function TutorDashboardPage() {
  // Only tutors may view this dashboard.
  const session = await requireRole("tutor")
  return <DashboardOverview session={session} />
}
