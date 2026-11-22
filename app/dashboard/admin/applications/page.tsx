import { requireRole } from "@/lib/authHelper"
import { ApplicationsList } from "@/components/dashboard/applications-list"

export const metadata = { title: "Manage Applications" }

export default async function AdminApplicationsPage() {
  await requireRole("admin")

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Manage Applications
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review every student application across the platform. Accept or reject
          any pending application.
        </p>
      </header>

      <ApplicationsList mode="admin" />
    </div>
  )
}
