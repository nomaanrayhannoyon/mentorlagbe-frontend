import { requireRole } from "@/lib/authHelper"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side session + role enforcement. Anonymous users are redirected
  // to sign-in by requireSession(); the role is validated here.
  const session = await requireRole(["student", "tutor", "admin"])

  return (
    <DashboardShell
      role={session.user.role}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        plan: session.user.plan,
      }}
    >
      {children}
    </DashboardShell>
  )
}
