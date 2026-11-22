import { requireRole } from "@/lib/authHelper"
import { ApplicationsList } from "@/components/dashboard/applications-list"

export const metadata = { title: "Applications" }

export default async function ApplicationsPage() {
  const session = await requireRole(["student", "tutor", "admin"])

  // Admins get the student view (their own) for now; the full admin view
  // lives under /dashboard/admin.
  const mode = session.user.role === "tutor" ? "tutor" : "student"

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {mode === "tutor" ? "Applications to your tuitions" : "My applications"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {mode === "tutor"
            ? "Review and manage students who applied to your tuitions."
            : "Track the status of tuitions you have applied to."}
        </p>
      </header>

      <ApplicationsList mode={mode} />
    </div>
  )
}