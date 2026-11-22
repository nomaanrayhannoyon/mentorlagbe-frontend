import { redirect } from "next/navigation"
import { requireRole } from "@/lib/authHelper"

export const metadata = { title: "Dashboard" }

/**
 * Canonical dashboard entry. Redirects to the role-specific dashboard so the
 * URL always reflects the user's role (/dashboard/student|tutor|admin).
 */
export default async function DashboardPage() {
  const session = await requireRole(["student", "tutor", "admin"])
  redirect(`/dashboard/${session.user.role}`)
}
